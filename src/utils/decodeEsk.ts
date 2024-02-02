export const decodeEsk = (encodedEsk: string): Record<string, unknown> => {
  return JSON.parse(
    Buffer.from(decodeURIComponent(encodedEsk), 'base64').toString('utf-8')
  );
};
