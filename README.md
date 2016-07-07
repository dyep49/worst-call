# worst-call

A command line tool to identify the worst call of a day by an umpire in the MLB. Primarily used as a debugging/verification tool for [Umpire Auditor](https://github.com/dyep49/Angular-Umpire-Auditor/).

## Usage 
```
worst-call command --date [day]-[month]-[year]
```

For example, to find the worst call on July 4, 2016
```
$ worst-call --date 7-4-2016
```
Expected response
```
Raw pitch data: 
 { des: 'Called Strike',
  des_es: 'Strike cantado',
  id: 342,
  type: 'S',
  tfs: 191212,
  tfs_zulu: '2016-07-04T19:12:12Z',
  x: 163.43,
  y: 164.13,
  event_num: 342,
  on_1b: 593428,
  sv_id: '160704_151246',
  play_guid: '6ce95182-2438-48d6-8cd2-73b72caddd2d',
  start_speed: 84.3,
  end_speed: 78.1,
  sz_top: 3.81,
  sz_bot: 1.8,
  pfx_x: -4.53,
  pfx_z: 5.41,
  px: -1.218,
  pz: 2.765,
  x0: -1.538,
  y0: 50,
  z0: 6.237,
  vx0: 2.221,
  vy0: -123.563,
  vz0: -3.626,
  ax: -7.022,
  ay: 23.954,
  az: -23.715,
  break_y: 23.8,
  break_angle: 15.2,
  break_length: 6.6,
  pitch_type: 'CH',
  type_confidence: 0.317,
  zone: 13,
  nasty: 42,
  spin_dir: 219.696,
  spin_rate: 1290.805,
  cc: '',
  mt: '' }
The worst call missed by 6.116399999999999 inches
```
