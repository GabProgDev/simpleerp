import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { DateRange } from '../types/Reports';

interface ReportFilterProps {
  range: DateRange;
  onFilter: (range: DateRange) => void;
  onClear: () => void;
}

export const ReportFilter: React.FC<ReportFilterProps> = ({ range, onFilter, onClear }) => {
  const [localFrom, setLocalFrom] = React.useState(range.from.toISOString().split('T')[0]);
  const [localTo, setLocalTo] = React.useState(range.to.toISOString().split('T')[0]);

  const handleApply = () => {
    const from = new Date(localFrom);
    from.setHours(0, 0, 0, 0);
    // Ajuste fuso horário simples adicionando horas se necessário, ou aceitando que new Date('yyyy-mm-dd') é UTC
    // Para simplificar local:
    const fromParts = localFrom.split('-');
    const fromDate = new Date(Number(fromParts[0]), Number(fromParts[1]) - 1, Number(fromParts[2]), 0, 0, 0);

    const toParts = localTo.split('-');
    const toDate = new Date(Number(toParts[0]), Number(toParts[1]) - 1, Number(toParts[2]), 23, 59, 59);

    onFilter({ from: fromDate, to: toDate });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
      <Input 
        type="date" 
        label="Data Inicial" 
        value={localFrom} 
        onChange={e => setLocalFrom(e.target.value)} 
        className="w-full md:w-auto"
      />
      <Input 
        type="date" 
        label="Data Final" 
        value={localTo} 
        onChange={e => setLocalTo(e.target.value)} 
        className="w-full md:w-auto"
      />
      <div className="flex gap-2">
        <Button onClick={handleApply} icon={<Search size={16} />}>
          Aplicar Filtro
        </Button>
        <Button variant="secondary" onClick={onClear} icon={<RotateCcw size={16} />} title="Mês Atual">
          Limpar
        </Button>
      </div>
    </div>
  );
};