// DynamoDB-backed store. Tables (partition key `id`, type String): jx-complaints, jx-tasks, jx-handovers, jx-audit
// Created by scripts/create-tables.sh. Scan-based list() is fine at demo scale.
export async function createDynamoStore() {
  const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const doc = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.AWS_REGION }),
    { marshallOptions: { removeUndefinedValues: true } },
  );
  const name = (t) => `${process.env.TABLE_PREFIX || 'jx-'}${t}`;
  return {
    kind: 'dynamo',
    async get(t, id) {
      const r = await doc.send(new GetCommand({ TableName: name(t), Key: { id } }));
      return r.Item || null;
    },
    async put(t, item) {
      await doc.send(new PutCommand({ TableName: name(t), Item: item }));
      return item;
    },
    async list(t, filter = () => true) {
      const out = [];
      let key;
      do {
        const r = await doc.send(new ScanCommand({ TableName: name(t), ExclusiveStartKey: key }));
        out.push(...(r.Items || []));
        key = r.LastEvaluatedKey;
      } while (key);
      return out.filter(filter);
    },
  };
}
