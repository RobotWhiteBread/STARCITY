import json,glob,pickle,collections
G='/home/claude/data/gis/'
P=[]
for f in sorted(glob.glob(G+'parcels2/*.json')):
    for ft in json.load(open(f))['features']:
        P.append((ft.get('attributes',ft.get('properties')),ft.get('geometry')))
S=[]
for f in sorted(glob.glob(G+'sales/*.json')):
    S+= [ft.get('attributes',ft.get('properties')) for ft in json.load(open(f))['features']]
T=[ft.get('attributes',ft.get('properties')) for ft in json.load(open(glob.glob(G+'tif/*.json')[0]))['features']]
pickle.dump((P,S,T),open('all.pkl','wb'))
print(len(P),len(S),len(T))
