import json
import os
from os import listdir
from os.path import isfile, join
from episode import Episode, EpisodeGrpup
from datetime import date

DATA_PATH = './data'
OUTPUT_PATH = './output'

episodes = []
for i in [f for f in listdir(DATA_PATH) if isfile(join(DATA_PATH, f))]:
  with open(DATA_PATH + '/' + i) as f:
    episodes.append(Episode(json.load(f)))

avrs = [sum(episode.numbers) / len(episode.numbers) for episode in episodes]
mideans = [(min(episode.numbers) + max(episode.numbers)) / 2 for episode in episodes]

GROUPING_VALUE = 20
statistics = []
for i in range(0, len(episodes) - GROUPING_VALUE):
  statistics.append(EpisodeGrpup(episodes[i:i + GROUPING_VALUE]).statistics)

if not os.path.exists(OUTPUT_PATH):
    os.makedirs(OUTPUT_PATH)
with open(OUTPUT_PATH + '/' + 'statistics.json', 'w') as f:
  json.dump({'avrs': avrs, 'mideans': mideans, 'statistics': statistics} ,f)
