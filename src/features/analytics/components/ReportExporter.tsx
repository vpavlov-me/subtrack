import { useState } from 'react';
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from './DateRangePicker';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface ReportExporterProps {
  reportType: string;
  dateRange: DateRange;
  onExport: (format: string) => Promise<void>;
}

export function ReportExporter({
  reportType,
  dateRange,
  onExport,
}: ReportExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const reportOptions = [
    {
      value: 'spending',
      label: 'Spending Report',
      description: 'Monthly spending breakdown by category',
    },
    {
      value: 'subscriptions',
      label: 'Subscriptions Report',
      description: 'Active subscriptions and their details',
    },
    {
      value: 'trends',
      label: 'Trends Report',
      description: 'Spending trends over time',
    },
  ];

  const selectedReport = reportOptions.find(r => r.value === reportType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </CardTitle>
        <CardDescription>
          Export your data in CSV or JSON format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={() => {}}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={selectedFormat} onValueChange={(value: 'csv' | 'json') => setSelectedFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
