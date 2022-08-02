export const getGroupIndex = (level_: number) => {
    let groupIndex_ = 0;
    if(level_ <= 5) groupIndex_ = 0;
    else if(level_ <= 10) groupIndex_ = 1;
    else if(level_ <= 15) groupIndex_ = 2;
    else if(level_ <= 20) groupIndex_ = 3;
    return groupIndex_;
};

export const getDifficulty = (groupIndex) => {
    return groupIndex === 0
      ? "novice"
      : groupIndex === 1
      ? "apprentice"
      : groupIndex === 2
      ? "journeyman"
      : groupIndex === 3
      ? "defender"
      : null;
  };
  