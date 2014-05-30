var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
}

DemoChart({
  adapter: VouchDB,
  url: 'http://jsbin.com/dukom/2.json',
  loc: 1,
  field: 'ws',
  title: 'Velocità',
  label: 'm/s',
  margin: margin,
  width: 480,
  height: 250,
  size: 60,
  interval: 5000,
  delay: 1000
})

DemoChart({
  adapter: VouchDB,
  url: 'http://jsbin.com/dukom/2.json',
  loc: 1,
  field: 't',
  title: 'Temperatura',
  label: 'C°',
  margin: margin,
  width: 480,
  height: 250,
  size: 60,
  interval: 5000,
  delay: 2000
})

DemoChart({
  adapter: VouchDB,
  url: 'http://jsbin.com/dukom/2.json',
  loc: 2,
  field: 'l',
  title: 'Temperatura',
  label: 'C°',
  margin: margin,
  width: 480,
  height: 250,
  size: 60,
  interval: 5000,
  delay: 3000
})

DemoChart({
  adapter: PouchDB,
  url: 'http://localhost:5984/makerfaire',
  loc: 1,
  field: 'value',
  title: 'Temperatura',
  label: 'C°',
  margin: margin,
  width: 480,
  height: 250,
  size: 60,
  interval: 5000,
  delay: 4000
})
