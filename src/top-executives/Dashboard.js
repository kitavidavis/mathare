import { useEffect, useState } from 'react';
import {AppShell,Header,Text,MediaQuery,Title as Title2,useMantineTheme, SimpleGrid, Grid, Paper, createStyles, Group, Switch, Select, RingProgress, Center, ScrollArea, Anchor, UnstyledButton} from '@mantine/core';
import { MapContainer, TileLayer, GeoJSON, LayersControl, Polyline, LayerGroup, Circle, CircleMarker } from 'react-leaflet'
import L from "leaflet"
import SewerNetworks from '../assets/Sewer-Networks';
import Valves from '../assets/Sewer-Manholes';
import { useViewportSize } from '@mantine/hooks';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from "chart.js";
import { Line, Bar } from 'react-chartjs-2';
import { ArrowUp, Checklist, Forms, Refresh, Stack3 } from 'tabler-icons-react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Filler,
    Legend,
  );
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
  
      title: {
        display: false,
        text: 'Sewer Network Monitoring',
      },
    },
  };
const useStyles = createStyles((theme) => ({
    header: {
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
    },
  
    inner: {
      height: 70,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    body: {
      display: 'flex',
      alignItems: 'center',
    },
  
    track: {
      width: 40,
      height: 6,
      overflow: 'visible',
    },
  
    thumb: {
      width: 20,
      height: 20,
      left: -2,
      transition: 'background-color 100ms ease, left 100ms ease',
  
      'input:checked + * > &': {
        backgroundColor: theme.fn.primaryColor(),
      },
    },
  }));

export default function ExecutiveDashboard() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { height, width} = useViewportSize();
  const [light, setLight] = useState(false);
  const [basemap, setBasemap] = useState(false);
  const { classes } = useStyles();
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [vandalism, setVandalism] = useState([]);
  const [manhole, setManhole] = useState([]);
  const [burst, setBurst] = useState([]);

  const getDataset = () => {
    axios.post("/forms/get-forms").then(function(res){
        if(res.status === 200){
            setData(res.data.data);
        }
    }).catch(function(error){
        alert(error.message);
    })
  }
  useEffect(() => {
    getDataset();
  }, [refresh])

  useEffect(() => {
    let v = [];
    let m = [];
    let b = [];

    for(let i=0; i<data.length; i++){
        let item = data[i].type;

        switch(item){
            case "Vandalism":
                v.push(data[i]);
                break;
            case "Manhole":
                m.push(data[i]);
                break;
            case "Burst":
                b.push(data[i]);
                break
        }
    }

    setVandalism(v);
    setManhole(m);
    setBurst(b);

  }, [data])

  const MapPanel = () => {
    return (
        <MapContainer style={{height: height - 70, width: '100%', backgroundColor: "black"}} center={[-1.256365360250044, 36.875916535061734]} zoom={18}>
        <LayersControl>
        {basemap ? (
        <>
    <LayersControl.BaseLayer checked={basemap} name='OSM'>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url= { !light ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
    />
    </LayersControl.BaseLayer>
        </>
      ) : null}
          <LayersControl.Overlay name='Sewer Networks' checked>
             <GeoJSON style={(f, l) => {
                return {
                    color: f.properties.Condition === "Fair" ? theme.colors.cyan[6] : theme.colors.red[6],
                    fillColor: theme.colors.cyan[6]
                }
             }} data={SewerNetworks} />
          </LayersControl.Overlay>
          <LayersControl.Overlay name='Manholes' checked>
          <GeoJSON data={Valves} pointToLayer={(f, latLng) => {
            return new L.CircleMarker(latLng, {
              opacity: 1,
              fillOpacity: 1,
              weight: 2,
              color: theme.colors.cyan[6],
              fillColor: theme.colors.cyan[6],
              radius: 7
            })
          }} />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Vandalism Cases" checked>
            <LayerGroup>
            {vandalism.length > 0 ? (
            vandalism.map((item, index) => {
              return (
                <CircleMarker key={`circle-${index}`} center={[item.coordinates.latitude, item.coordinates.longitude]} radius={10} pathOptions={{color: "red", fillColor: "red", fillOpacity: 1}} />
              )
            })
          ) : null}
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Conduit Burst Cases" checked>
            <LayerGroup>
            {burst.length > 0 ? (
            burst.map((item, index) => {
              return (
                <CircleMarker key={`circle-${index}`} center={[item.coordinates.latitude, item.coordinates.longitude]} radius={10} pathOptions={{color: "red", fillColor: "red", fillOpacity: 1}} />
              )
            })
          ) : null}
            </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Manhole Blockage Cases" checked>
            <LayerGroup>
            {manhole.length > 0 ? (
            manhole.map((item, index) => {
              return (
                <CircleMarker key={`circle-${index}`} center={[item.coordinates.latitude, item.coordinates.longitude]} radius={10} pathOptions={{color: "red", fillColor: "red", fillOpacity: 1}} />
              )
            })
          ) : null}
            </LayerGroup>
            </LayersControl.Overlay>
        </LayersControl>
  </MapContainer>
    )
}

function VandalismChart(){
    const theme = useMantineTheme();
  
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let m = 0;
    let t = 0;
    let w = 0;
    let th = 0;
    let fr = 0;
    let sat = 0;
    let sun = 0;

    for(let i=0; i<vandalism.length; i++){
        let item = new Date(vandalism[i].createdAt).getDay();
        
        switch(item){
            case 1:
                m += 1;
                break;
            case 2:
                t += 1;
                break;
            case 3:
                w += 1;
                break;
            case 4:
                th += 1;
                break;
            case 5:
                fr += 1;
                break;
            case 6:
                sat += 1;
                break
            case 7:
                sun += 1;
                break;
        }
    }

    let data = [m, t, w, th, fr, sat, sun];
  
    const consumptionData = {
        labels,
        datasets: [
          {
            label: 'Vandalism',
            lineTension: 0.4,
            data: data,
            borderColor: theme.colors.cyan[6]
          }
        ],
      };
    return (
        <Line options={options} data={consumptionData} />
    )
  }

  function ManholeChart(){
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
    let m = 0;
    let t = 0;
    let w = 0;
    let th = 0;
    let fr = 0;
    let sat = 0;
    let sun = 0;

    for(let i=0; i<manhole.length; i++){
        let item = new Date(manhole[i].createdAt).getDay();
        
        switch(item){
            case 1:
                m += 1;
                break;
            case 2:
                t += 1;
                break;
            case 3:
                w += 1;
                break;
            case 4:
                th += 1;
                break;
            case 5:
                fr += 1;
                break;
            case 6:
                sat += 1;
                break
            case 7:
                sun += 1;
                break;
        }
    }

    let data = [m, t, w, th, fr, sat, sun];

    const consumptionData = {
        labels,
        datasets: [
          {
            label: 'Manhole',
            data: data,
            borderColor: theme.colors.cyan[6],
            backgroundColor: theme.colors.cyan[6],
          }
        ],
      };
    return (
        <Bar options={options} data={consumptionData} />
    )
  }

  function BurstChart(){
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
    let m = 0;
    let t = 0;
    let w = 0;
    let th = 0;
    let fr = 0;
    let sat = 0;
    let sun = 0;

    for(let i=0; i<burst.length; i++){
        let item = new Date(burst[i].createdAt).getDay();
        
        switch(item){
            case 1:
                m += 1;
                break;
            case 2:
                t += 1;
                break;
            case 3:
                w += 1;
                break;
            case 4:
                th += 1;
                break;
            case 5:
                fr += 1;
                break;
            case 6:
                sat += 1;
                break
            case 7:
                sun += 1;
                break;
        }
    }

    let data = [m, t, w, th, fr, sat, sun];
  
    const consumptionData = {
        labels,
        datasets: [
          {
            label: 'Conduit Burst',
            lineTension: 0.4,
            data: data,
            borderColor: theme.colors.cyan[6],
            backgroundColor: theme.colors.cyan[6],
          }
        ],
      };
    return (
        <Line options={options} data={consumptionData} />
    )
  }

  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      header={
        <Header height={{ base: 50, md: 70 }} style={{backgroundColor: "teal"}} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', width: "100%" }}>
            <Stack3 color='white' />
            <div style={{marginLeft: 10}}>
            <Title2 order={3} color="white">MATHARE SEWER SYSTEM</Title2>
            <Text size="sm" color="white">Sewer assets and connections</Text>
            </div>
            <div style={{marginLeft: 'auto', display: "flex"}}>
                <Group spacing={1} mr={20}>
                    <UnstyledButton onClick={() => {setRefresh(!refresh)}}>
                        <div style={{display: "flex"}}>
                        <Refresh color='white' />
                    <Text color="white">Refresh</Text>
                        </div>
                    </UnstyledButton>
                </Group>
                <Group spacing={0}>
                <Checklist color='white' />
                <Anchor component={Link} to="/form" style={{textDecoration: 'none', color: "white"}}>Questionnare</Anchor>
                </Group>
            </div>
          </div>
        </Header>
      }
    >
        <Grid>
            <Grid.Col md={12} lg={3}>
                <Paper p="md" style={{height: height - 70}} withBorder>
                <ScrollArea mb={10} type='never' style={{height: (height - 70) * 0.3}}>
                    <Center mb={20}>
                    <Text>Vandalism Cases Distribution</Text>
                    </Center>
                    <VandalismChart />
                </ScrollArea>

                <ScrollArea mb={10} type='never' style={{height: (height - 70) * 0.3}}>
                    <Center mb={20}>
                    <Text>Manhole-blockage Cases Distribution</Text>
                    </Center>
                    <ManholeChart />
                </ScrollArea>

                <ScrollArea mb={10} type='never' style={{height: (height - 70) * 0.3}}>
                    <Center mb={20}>
                    <Text>Conduit Burst Cases Distribution</Text>
                    </Center>
                    <BurstChart />
                </ScrollArea>
                </Paper>
            </Grid.Col>
            <Grid.Col md={12} lg={6}>
                <Paper style={{height: height - 70, width: '100%'}}>
                <MapPanel />
                </Paper>
            </Grid.Col>
            <Grid.Col md={12} lg={3}>
            <Paper p="md" style={{height: height - 70}} withBorder>
            <Title2 order={3}>Introduction</Title2>
            <Text mb={10} lineClamp={10}>
              Sewer Asset Monitoring Dashboard for Mathare Constituency
            </Text>
            <Group mb={10} p="md">
              <Switch checked={light} onChange={(e) => {setLight(e.target.checked)}} label="Light Basemap" classNames={classes} />
            </Group>
            <Group mb={10} p="md">
            <Switch checked={basemap} onChange={(e) =>{setBasemap(e.target.checked)}} label="Basemap On" classNames={classes} />
            </Group>

            <Paper mb={20} withBorder shadow="sm" p="xs">
                <Center mb={10}>Manholes Analysis</Center>
                <Group grow>
                    
              <div>
                <RingProgress size={80} roundCaps thickness={4} sections={[{value: Valves.features.length, color: theme.colors.cyan[6]}]} label={
                  <Center>
                    <Text>{Valves.features.length}</Text>
                  </Center>
                } />
                <Center ml={-10}>
                  <Text size="sm">Functional Manholes</Text>
                </Center>
              </div>

              <div>
                <RingProgress size={80} roundCaps thickness={4} sections={[{value: 0, color: theme.colors.red[6]}]} label={
                  <Center>
                    <Text>0</Text>
                  </Center>
                } />
                <Center ml={10}>
                  <Text size="sm">Non-functional Manholes</Text>
                </Center>
              </div>
                </Group>
            </Paper>

            <Paper mb={20} withBorder shadow="sm" p="xs">
                <Center mb={10}>Sewer Mains Analysis</Center>
                <Group grow>
                    
              <div>
                <RingProgress size={80} roundCaps thickness={4} sections={[{value: SewerNetworks.features.length, color: theme.colors.cyan[6]}]} label={
                  <Center>
                    <Text>{SewerNetworks.features.length}</Text>
                  </Center>
                } />
                <Center ml={-10}>
                  <Text size="sm">Functional Mains</Text>
                </Center>
              </div>

              <div>
                <RingProgress size={80} roundCaps thickness={4} sections={[{value: 0, color: theme.colors.red[6]}]} label={
                  <Center>
                    <Text>0</Text>
                  </Center>
                } />
                <Center ml={10}>
                  <Text size="sm">Non-functional Mains</Text>
                </Center>
              </div>
                </Group>
            </Paper>
            </Paper>
            </Grid.Col>
        </Grid>
    </AppShell>
  );
}