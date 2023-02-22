import { ActionIcon, Anchor, Button, Center, Checkbox, CheckIcon, Container, Divider, FileInput, Grid, Group, Input, NumberInput, Paper, Radio, Select, SimpleGrid, Space, Text, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { DatePicker, TimeInput } from '@mantine/dates';
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { Check, Crosshair, Trash } from "tabler-icons-react";
import { Link } from "react-router-dom";
import axios from "./utils/axios";

export default function Form(){
    const [coordinates, setCoordinates] = useState({latitude: null, longitude: null});
    const [type, setType] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const ZoomComponent = () => {
        const mapEvents = useMapEvents({
            click: (e) => {
                setCoordinates({latitude: e.latlng.lat, longitude: e.latlng.lng});
            }
        });
    
    
        return null
    }

    const captureCoordinates = () => {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition((position) => {
                setCoordinates({latitude: position.coords.latitude, longitude: position.coords.longitude});
            })
        }
    }

    const submitResponse = () => {
        setLoading(true);
        axios.post("/forms/create", {
            type: type,
            coordinates: coordinates
        }).then(function(res){
            if(res.status === 200){
                setLoading(false);
                setSubmitted(true);
            }
        }).catch(function(error){
            setLoading(false);
            alert(error.message);
        })
    }
    
    return (
        <Container size={1000}>
            <Paper p="md" mt={40} withBorder>
            {!submitted ? (
                <>
                            <Title mb={10} order={3}>Mathare Sewer System</Title>
            <Text>A public questionnare for capturing complains and other related sewer data.</Text>
            <Space h={"md"} />
            <Divider />
            <Space h={"md"} />
            <Text mb={20}>Questions labelled <span style={{color: 'red'}}>*</span> are mandatory.</Text>
            <Select dropdownPosition="top"  data={[
                {label: "Vandalism", value: "Vandalism"},
                {label: "Manhole Blockage", value: "Manhole"},
                {label: "Conduit Burst", value: "Burst"}
            ]} value={type} onChange={(val) => {setType(val)}} withAsterisk label="Please select the best choice that fits what you are seeing." />


                    <Text  mt={15} mb={10}>GPS Coordinates</Text>
                            <Grid columns={12}>
                                <Grid.Col md={12} lg={6}>
                                    <Paper style={{height: 270, width: '100%'}}>
                                    <MapContainer style={{width: '100%', height: '100%'}} center={[-1.265614385767745, 36.845314172878176]} zoom={15}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                        <ZoomComponent />
                                    </MapContainer>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col md={12} lg={6}>
                                    <Group position="right">
                                        <ActionIcon onClick={() => {captureCoordinates()}} title="Capture coordinates">
                                            <Crosshair color="green" />
                                        </ActionIcon>
                                        <ActionIcon title="Clear coordinates">
                                            <Trash color="red" />
                                        </ActionIcon>
                                    </Group>
                                    <TextInput readOnly value={coordinates.latitude} label="Latitude"  />
                                    <TextInput readOnly  value={coordinates.longitude} label="Longitude"  />
                                </Grid.Col>
                            </Grid>
            <Space h={"md"} />
            <Divider />
            <Space h={"md"} />
            <Button loading={loading} onClick={() => {submitResponse()}}>Submit</Button>
                </>
            ) : (
                <>
                <Center>
                    <Check size={50} color="teal" />
                </Center>
                <Center>
                    <Text>Response successfully captured.</Text>
                </Center>
                <Center>
                    <Anchor href="#" onClick={() => {
                        setSubmitted(false);
                        setType("");
                        setCoordinates({latitude: null, longitude: null})
                    }}>Submit Another Response</Anchor>
                </Center>
                </>
            )}
        </Paper>
        </Container>
    )
}