import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { MonthlyAverage } from '../data/loader';

interface PriceChartProps {
    data: MonthlyAverage[];
    fuelType: string;
    city: string;
    year: number;
}

export function PriceChart({ data, fuelType, city, year }: PriceChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        // Initialize chart
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);

            // Handle resize
            const handleResize = () => {
                chartInstance.current?.resize();
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chartInstance.current?.dispose();
                chartInstance.current = null;
            };
        }
    }, []);

    useEffect(() => {
        if (!chartInstance.current) return;

        const option: echarts.EChartsOption = {
            title: {
                text: `Monthly Average ${fuelType} Prices in ${city} (${year})`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const val = params[0].value;
                    // Format detailed tooltip
                    return `${params[0].name} ${year}<br/>${params[0].marker} ${fuelType}: ₹${val.toFixed(2)}`;
                }
            },
            xAxis: {
                type: 'category',
                data: data.map(d => d.month),
                name: 'Month'
            },
            yAxis: {
                type: 'value',
                name: 'Price (₹)',
                axisLabel: {
                    formatter: '₹{value}'
                }
            },
            series: [
                {
                    name: fuelType,
                    type: 'bar',
                    data: data.map(d => d.avgPrice),
                    itemStyle: {
                        color: fuelType === 'Petrol' ? '#ff7c7c' : '#5470c6'
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: (params: any) => params.value.toFixed(1)
                    }
                }
            ],
            grid: {
                containLabel: true,
                left: '3%',
                right: '4%',
                bottom: '3%'
            }
        };

        chartInstance.current.setOption(option);
    }, [data, fuelType, city, year]);

    return <div ref={chartRef} style={{ width: '100%', height: '500px' }} />;
}
