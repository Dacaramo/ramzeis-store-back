import { UpdateCommandInput } from '@aws-sdk/lib-dynamodb';

export const generateUpdateProps = (patch: Record<string, unknown>) => {
  let exp: Partial<UpdateCommandInput> = {
    UpdateExpression: 'set',
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };
  for (const [key, value] of Object.entries(patch)) {
    exp.UpdateExpression += ` #${key} = :${key},`;
    exp.ExpressionAttributeNames![`#${key}`] = key;
    exp.ExpressionAttributeValues![`:${key}`] = value;
  }
  // remove trailing comma
  exp.UpdateExpression = exp.UpdateExpression!.slice(0, -1);
  return exp;
};
