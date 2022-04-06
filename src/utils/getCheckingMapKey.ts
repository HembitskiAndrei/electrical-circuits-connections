export const getCheckingMapKey = (wireId: string) => {
  const words = wireId.split("-");
  const firstWord = words[0].split("_")[0];
  const secondWord = words[1].split("_")[0];

  return [firstWord, secondWord].join("-");
};
