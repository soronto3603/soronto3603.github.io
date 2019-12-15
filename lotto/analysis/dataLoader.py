import urllib.request as request
import json
import os
from os import listdir
from os.path import isfile, join
from episode import Episode
from datetime import date

DATA_PATH = './data'
if not os.path.exists(DATA_PATH):
    os.makedirs(DATA_PATH)

episodes = [f for f in listdir(DATA_PATH) if isfile(join(DATA_PATH, f))]
if len(episodes) == 0:
  # download
  episodeNumber = 1

  while (True):
    req = request.Request('http://www.nlotto.co.kr/common.do?method=getLottoNumber&drwNo=%d' % episodeNumber)
    with request.urlopen(req) as response:
      try:
        episode = Episode(json.load(response))
        with open(DATA_PATH + '/' + '%s' % episode.drwNoDate, 'w') as f:
          json.dump(episode.raw, f)
      except KeyError:
        break
    episodeNumber = episodeNumber + 1

else:
  print('마지막부터 다운로드 미구현')
  pass


