class Episode:
  def __init__(self, obj):
    self.totSellamnt: int = obj['totSellamnt']
    self.returnValue: str = obj['returnValue']
    self.drwNoDate: str = obj['drwNoDate']
    self.firstWinamnt: int = obj['firstWinamnt']
    self.firstPrzwnerCo: int = obj['firstPrzwnerCo']
    self.firstAccumamnt: int = obj['firstAccumamnt']
    self.drwtNo6: int = obj['drwtNo6']
    self.drwtNo5: int = obj['drwtNo5']
    self.drwtNo4: int = obj['drwtNo4']
    self.drwtNo3: int = obj['drwtNo3']
    self.drwtNo2: int = obj['drwtNo2']
    self.drwtNo1: int = obj['drwtNo1']
    self.bnusNo: int = obj['bnusNo']
    self.numbers = [self.drwtNo1, self.drwtNo2, self.drwtNo3, self.drwtNo4, self.drwtNo5, self.drwtNo6, self.bnusNo]
    self.raw = obj

  def __repr__(self):
    return "[%s %s %s %s %s %s]" % (self.drwtNo1, self.drwtNo2, self.drwtNo3, self.drwtNo4, self.drwtNo5, self.drwtNo6)

class EpisodeGrpup:
  def __init__(self, episodes: [Episode]):
    self.statistics = [0] * 46
    for episode in episodes:
      for n in episode.numbers:
        self.statistics[n] = self.statistics[n] + 1
    self.statistics = [n / len(episodes) for n in self.statistics]


