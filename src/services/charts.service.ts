import { SystemService } from './system.service';

export class ChartsService {
  static async generateResourceChartUrl(): Promise<string> {
    const cpuInfo = await SystemService.getCpuUsage();
    const ramInfo = SystemService.getRamUsage();
    
    const cpuVal = parseFloat(cpuInfo.usagePercent);
    const ramVal = parseFloat(ramInfo.usagePercent);

    const chartConfig = {
      type: 'doughnut',
      data: {
        labels: ['CPU Usage', 'Free CPU', 'RAM Usage', 'Free RAM'],
        datasets: [
          {
            data: [cpuVal, 100 - cpuVal],
            backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(255, 99, 132, 0.1)'],
          },
          {
            data: [ramVal, 100 - ramVal],
            backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(54, 162, 235, 0.1)'],
          }
        ]
      },
      options: {
        plugins: {
          title: { display: true, text: 'System Resources' }
        }
      }
    };
    
    return `https://quickchart.io/chart?w=400&h=300&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  }
}
