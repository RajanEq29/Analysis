import { useEffect, useState, useMemo } from 'react';
import { Container, Grid, Select, Title, Paper, LoadingOverlay, Text, Group } from '@mantine/core';
import { loadData, getUniqueCities, getUniqueYears, getMonthlyAverages, type RSPData, type MonthlyAverage } from '../data/loader';
import { PriceChart } from './PriceChart';

export function Dashboard() {
    const [data, setData] = useState<RSPData[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedFuel, setSelectedFuel] = useState<string | null>('Petrol');

    useEffect(() => {
        loadData()
            .then(d => {
                setData(d);

                // Set defaults
                const cities = getUniqueCities(d);
                const years = getUniqueYears(d);

                if (cities.length > 0) setSelectedCity(cities[0]);
                if (years.length > 0) setSelectedYear(years[years.length - 1].toString());

                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load data", err);
                setLoading(false);
            });
    }, []);

    const cities = useMemo(() => getUniqueCities(data), [data]);
    const years = useMemo(() => getUniqueYears(data).map(String), [data]);

    const chartData: MonthlyAverage[] = useMemo(() => {
        if (!selectedCity || !selectedYear || !selectedFuel) return [];
        return getMonthlyAverages(data, selectedCity, parseInt(selectedYear), selectedFuel as 'Petrol' | 'Diesel');
    }, [data, selectedCity, selectedYear, selectedFuel]);

    if (loading) return <LoadingOverlay visible />;

    return (
        <Container size="lg" py="xl">
            <Title order={1} mb="xl" ta="center">Petrol & Diesel Price Visualization</Title>

            <Paper shadow="xs" p="md" withBorder mb="xl">
                <Grid align="flex-end">
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Select
                            label="Select City"
                            placeholder="Choose a city"
                            data={cities}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            searchable
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Select
                            label="Select Fuel Type"
                            data={['Petrol', 'Diesel']}
                            value={selectedFuel}
                            onChange={setSelectedFuel}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Select
                            label="Select Year"
                            placeholder="Choose a year"
                            data={years}
                            value={selectedYear}
                            onChange={setSelectedYear}
                        />
                    </Grid.Col>
                </Grid>
            </Paper>

            <Paper shadow="md" p="md" withBorder style={{ minHeight: '500px', position: 'relative' }}>
                {chartData.length > 0 ? (
                    <PriceChart
                        data={chartData}
                        fuelType={selectedFuel || 'Petrol'}
                        city={selectedCity || ''}
                        year={parseInt(selectedYear || '0')}
                    />
                ) : (
                    <Group justify="center" align="center" style={{ height: '100%' }}>
                        <Text c="dimmed">Select filters to view data</Text>
                    </Group>
                )}
            </Paper>
        </Container>
    );
}
