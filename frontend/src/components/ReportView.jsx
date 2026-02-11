import { useState } from "react";
import reportService from "../services/report.service";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Button, Box, Chip, Alert, CircularProgress,
  Card, CardContent, Grid, Tooltip, IconButton, Divider,
  ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TuneIcon from '@mui/icons-material/Tune';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNotification } from "../components/NotificationProvider";

const ReportView = () => {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [from, setFrom] = useState(dayjs().subtract(1, 'month'));
  const [to, setTo] = useState(dayjs());
  const [activeReport, setActiveReport] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState("none"); // "none", "active", "custom"

  const { showNotification } = useNotification();

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Función para cargar reportes
  const loadReport = async (reportType, forceDateFilter = false) => {
    setLoading(true);
    setError("");
    setActiveReport(reportType);
    
    try {
      let res;
      const useDateFilter = forceDateFilter || dateFilterMode === "active";
      
      switch (reportType) {
        case "active":
          res = await reportService.activeLoans(
            useDateFilter ? from.startOf('day').format('YYYY-MM-DDTHH:mm:ss') : null,
            useDateFilter ? to.endOf('day').format('YYYY-MM-DDTHH:mm:ss') : null
          );
          setData(res.data || []);
          setTitle(`Préstamos Activos ${useDateFilter ? `(${formatDateRange()})` : ""}`);
          showNotification(
            `✅ Se cargaron ${res.data?.length || 0} préstamos activos ${useDateFilter ? "con filtro de fechas" : ""}`,
            "success"
          );
          break;
          
        case "top":
          res = await reportService.topTools(
            useDateFilter ? from.startOf('day').format('YYYY-MM-DDTHH:mm:ss') : null,
            useDateFilter ? to.endOf('day').format('YYYY-MM-DDTHH:mm:ss') : null
          );
          
          const formattedData = Array.isArray(res.data) 
            ? res.data.map(item => ({
                id: item.toolGroupId,
                toolGroupName: item.toolGroupName,
                total: item.total,
                category: item.category || "Sin categoría"
              })).sort((a, b) => b.total - a.total)
            : [];
          
          setData(formattedData);
          setTitle(`Herramientas Más Solicitadas ${useDateFilter ? `(${formatDateRange()})` : ""}`);
          showNotification(
            `📊 Ranking generado con ${formattedData.length} herramientas ${useDateFilter ? "del período seleccionado" : ""}`,
            "success"
          );
          break;
          
        case "debt":
          // Los clientes con deudas no usan filtro de fechas
          res = await reportService.customersWithDebt();
          
          if (!res.data || res.data.length === 0) {
            setData([]);
            setTitle("Clientes con Deudas Pendientes (0 encontrados)");
            showNotification("✅ No se encontraron clientes con deudas pendientes", "info");
          } else {
            setData(res.data);
            setTitle("Clientes con Deudas Pendientes");
            showNotification(`👥 Se encontraron ${res.data.length} clientes con deudas`, "success");
          }
          break;
          
        default:
          break;
      }
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
      setError(`Error al cargar el reporte: ${errorMsg}`);
      showNotification(`❌ Error al cargar reporte: ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Formatear rango de fechas para mostrar
  const formatDateRange = () => {
    return `${from.format('DD/MM/YYYY')} - ${to.format('DD/MM/YYYY')}`;
  };

  // Aplicar filtro de fechas a reporte actual
  const applyDateFilterToCurrent = () => {
    if (!activeReport) {
      showNotification("⚠️ Primero selecciona un reporte", "warning");
      return;
    }
    
    if (activeReport === "debt") {
      showNotification("ℹ️ El reporte 'Clientes con Deudas' no admite filtros por fecha", "info");
      return;
    }
    
    // Activar el modo de filtro y cargar
    setDateFilterMode("active");
    loadReport(activeReport, true);
  };

  // Limpiar 
  const clearAll = () => {
    setData([]);
    setTitle("");
    setActiveReport("");
    setDateFilterMode("none");
    setFrom(dayjs().subtract(1, 'month'));
    setTo(dayjs());
    setError("");
    showNotification("🧹 Todos los filtros y datos han sido limpiados", "info");
  };

  //obtener reporte
  const getReportLabel = (type) => {
  switch(type) {
    case "active": return "Préstamos Activos";
    case "top": return "Top Herramientas";
    case "debt": return "Clientes con Deudas";
    default: return "";
  }
};

  // Seleccionar presets de fecha rápidos
  const handleDatePreset = (preset) => {
    switch(preset) {
      case 'today':
        setFrom(dayjs().startOf('day'));
        setTo(dayjs().endOf('day'));
        break;
      case 'week':
        setFrom(dayjs().subtract(1, 'week'));
        setTo(dayjs());
        break;
      case 'month':
        setFrom(dayjs().subtract(1, 'month'));
        setTo(dayjs());
        break;
      case 'year':
        setFrom(dayjs().subtract(1, 'year'));
        setTo(dayjs());
        break;
    }
    showNotification(`✅ Período establecido: ${formatDateRange()}`, "info");
  };

  // Exportar datos a CSV
  const exportToCSV = () => {
    if (data.length === 0) {
      showNotification("📭 No hay datos para exportar", "warning");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    if (title.includes("Préstamos Activos")) {
      csvContent += "Cliente,Herramienta,Fecha Préstamo,Fecha Devolución,Estado\n";
      data.forEach(row => {
        csvContent += `"${row.customerName || ''}","${row.toolName || ''}",${formatDate(row.loanDate)},${formatDate(row.dueDate)},${row.status || ''}\n`;
      });
    } else if (title.includes("Herramientas")) {
      csvContent += "Posición,Herramienta,Categoría,N° Solicitudes,Porcentaje\n";
      const totalAll = data.reduce((sum, r) => sum + (r.total || 0), 0);
      data.forEach((row, index) => {
        const percentage = totalAll > 0 ? Math.round((row.total / totalAll) * 100) : 0;
        csvContent += `${index + 1},"${row.toolGroupName || ''}","${row.category || ''}",${row.total || 0},${percentage}%\n`;
      });
    } else if (title.includes("Clientes")) {
      csvContent += "Nombre,RUT,Email,Deuda Total,¿Atraso?,Fecha más antigua\n";
      data.forEach(row => {
        const hasOverdue = row.hasOverdueLoan === true || row.hasOverdueLoan === 'Sí';
        csvContent += `"${row.name || ''}","${row.rut || ''}","${row.email || ''}",${row.totalDebt || 0},${hasOverdue ? 'Sí' : 'No'},"${formatShortDate(row.oldestDueDate)}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("📤 Reporte exportado a CSV correctamente", "success");
  };

  // Formato de moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0";
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  // Renderizar tabla según el tipo de reporte (igual que tu versión original)
  const renderTable = () => {
    if (data.length === 0) return null;

    const lowerTitle = title.toLowerCase();

    // Tabla de herramientas más solicitadas
    if (lowerTitle.includes("herramientas") && lowerTitle.includes("solicitadas")) {
      const totalAll = data.reduce((sum, r) => sum + (r.total || 0), 0);
      
      return (
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', borderRadius: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }
              }}>
                <TableCell width="80px">N°</TableCell>
                <TableCell>Herramienta</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell width="150px">Solicitudes</TableCell>
                <TableCell width="120px">Porcentaje</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {data.map((row, index) => {
                const percentage = totalAll > 0 ? Math.round((row.total / totalAll) * 100) : 0;
                const isTopThree = index < 3;
                
                return (
                  <TableRow 
                    key={index} 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f0ff' },
                      backgroundColor: isTopThree ? '#fff8e1' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: isTopThree ? '#ffeb3b' : '#f5f5f5', 
                        width: 30, 
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        mx: 'auto'
                      }}>
                        {index + 1}
                      </Box>
                      {isTopThree && (
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#ff9800', fontWeight: 'bold' }}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      <Typography sx={{ 
                        maxWidth: '250px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.toolGroupName}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={row.category} 
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: '#e3f2fd', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1,
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {row.total}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: percentage > 50 ? '#e8f5e9' : '#e3f2fd',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: percentage > 50 ? '#2e7d32' : '#1976d2',
                          fontFamily: 'monospace'
                        }}>
                          {percentage}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Tabla de préstamos activos
    if (lowerTitle.includes("préstamos") && lowerTitle.includes("activos")) {
      return (
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', borderRadius: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }
              }}>
                <TableCell>Cliente</TableCell>
                <TableCell>Herramienta</TableCell>
                <TableCell width="180px">Fecha Préstamo</TableCell>
                <TableCell width="180px">Fecha Devolución</TableCell>
                <TableCell width="100px">Estado</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {data.map((row, index) => {
                const isOverdue = row.status === 'OVERDUE' || (row.dueDate && dayjs(row.dueDate).isBefore(dayjs()));
                
                return (
                  <TableRow 
                    key={index} 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f0ff' },
                      backgroundColor: isOverdue ? '#ffebee' : 'inherit'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium', maxWidth: '150px' }}>
                      <Typography sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.customerName || 'Sin nombre'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px' }}>
                      <Typography sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.toolName || 'Sin herramienta'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {formatDate(row.loanDate)}
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.8rem',
                      color: isOverdue ? '#f44336' : 'inherit',
                      fontWeight: isOverdue ? 'bold' : 'normal'
                    }}>
                      {formatDate(row.dueDate)}
                      {isOverdue && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#f44336' }}>
                          ⚠️ Vencido
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={isOverdue ? "VENCIDO" : (row.status || 'ACTIVO')} 
                        size="small"
                        sx={{
                          backgroundColor: isOverdue ? '#f44336' : '#4caf50',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem'
                        }}
                        icon={isOverdue ? <ErrorIcon /> : <CheckCircleIcon />}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Tabla de clientes con deudas
    if (lowerTitle.includes("clientes") && lowerTitle.includes("deudas")) {
      return (
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', borderRadius: 1 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }
              }}>
                <TableCell>Nombre</TableCell>
                <TableCell width="120px">RUT</TableCell>
                <TableCell>Email</TableCell>
                <TableCell width="150px">Deuda Total</TableCell>
                <TableCell width="100px">¿Atraso?</TableCell>
                <TableCell width="130px">Fecha más antigua</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {data.map((row, index) => {
                const hasOverdue = row.hasOverdueLoan === true || row.hasOverdueLoan === 'Sí';
                const totalDebt = row.totalDebt || 0;
                
                return (
                  <TableRow 
                    key={index} 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f0ff' },
                      backgroundColor: hasOverdue ? '#ffebee' : 'inherit'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium', maxWidth: '150px' }}>
                      <Typography sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.name || 'Sin nombre'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {row.rut || 'Sin RUT'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '200px' }}>
                      <Typography sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.email || 'Sin email'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: totalDebt > 0 ? '#ffebee' : '#e8f5e9', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1,
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: totalDebt > 0 ? '#d32f2f' : '#2e7d32'
                      }}>
                        {formatCurrency(totalDebt)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={hasOverdue ? 'Sí' : 'No'} 
                        size="small"
                        color={hasOverdue ? 'error' : 'success'}
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                        icon={hasOverdue ? <WarningIcon /> : <CheckCircleIcon />}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {formatShortDate(row.oldestDueDate)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  };

  const showResults = !loading && data.length > 0;
  const hasData = data.length > 0;

  return (
    <Paper sx={{ 
      p: 3, 
      background: "#ffffff",
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 120px)'
    }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon /> Reportes y Estadísticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Genera reportes personalizados de préstamos, clientes y herramientas.
          </Typography>
        </Box>
        
        {/* Indicadores de estado */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {activeReport && (
              <Chip 
                label={activeReport === 'active' ? "📋 Préstamos" : activeReport === 'top' ? "🏆 Ranking" : "👥 Deudas"} 
                color="primary" 
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
            {dateFilterMode === "active" && (
              <Chip 
                label={`📅 ${formatDateRange()}`} 
                color="secondary" 
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          {hasData && (
            <Typography variant="caption" color="text.secondary">
              {data.length} registros cargados
            </Typography>
          )}
        </Box>
      </Box>

      {/* Filtros de fecha COMPACTOS - Siempre desbloqueados */}
      <Card sx={{ 
        mb: 3, 
        backgroundColor: '#f8f9ff', 
        border: dateFilterMode === "active" ? '2px solid #6c63ff' : '1px solid #e0e0e0',
        boxShadow: dateFilterMode === "active" ? '0 0 0 1px #6c63ff' : 'none'
      }}>
        <CardContent sx={{ p: 2 }}>
          {/* Fila 1: Título + Botones */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon fontSize="small" color={dateFilterMode === "active" ? "primary" : "action"} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: dateFilterMode === "active" ? '#6c63ff' : 'inherit' }}>
                Configurar Fechas
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon fontSize="small" />}
                      onClick={clearAll}
                      sx={{ 
                        fontWeight: 'medium',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      Limpiar
                    </Button>
                    
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={dateFilterMode === "active" ? <CheckCircleIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                      onClick={applyDateFilterToCurrent}
                      disabled={!activeReport || activeReport === "debt"}
                      sx={{ 
                        backgroundColor: activeReport && activeReport !== "debt" ? '#6c63ff' : '#e0e0e0',
                        color: 'white',
                        fontWeight: 'bold',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        minWidth: '140px',
                        '&:hover': { 
                          backgroundColor: activeReport && activeReport !== "debt" ? '#5a52d5' : '#e0e0e0'
                        },
                        '&.Mui-disabled': {
                          backgroundColor: '#f5f5f5',
                          color: '#999'
                        }
                      }}
                    >
                      {dateFilterMode === "active" ? "Filtro Activo" : "Aplicar Filtro"}
                    </Button>
                  </Box>
                </Box>
          
          {/* Fila 2: Todo en una línea horizontal */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 1 }}>
            {/* Presets compactos */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[
                { key: 'today', label: 'Hoy' },
                { key: 'week', label: '7d' },
                { key: 'month', label: '30d' },
                { key: 'year', label: '1a' }
              ].map((preset) => (
                <Button
                  key={preset.key}
                  size="small"
                  variant="outlined"
                  onClick={() => handleDatePreset(preset.key)}
                  sx={{ 
                    fontSize: '0.7rem',
                    py: 0.25,
                    px: 1,
                    minWidth: 'auto',
                    textTransform: 'none',
                    borderColor: '#ddd',
                    '&:hover': {
                      borderColor: '#6c63ff',
                      backgroundColor: '#f0f4ff'
                    }
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </Box>
            
            {/* Separador */}
            <Box sx={{ width: '1px', height: '20px', backgroundColor: '#e0e0e0' }} />
            
            {/* DatePickers compactos */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DatePicker
                  label="Desde"
                  value={from}
                  onChange={(newVal) => {
                    setFrom(newVal ?? dayjs());
                    if (dateFilterMode === "active") setDateFilterMode("custom");
                  }}
                  slotProps={{ 
                    textField: { 
                      size: "small",
                      sx: { 
                        width: '150px',
                        '& .MuiInputBase-root': {
                          height: '32px',
                          fontSize: '0.8rem'
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.8rem'
                        }
                      }
                    } 
                  }}
                  maxDate={to}
                />
                
                <Typography variant="body2" sx={{ color: '#666' }}>
                  →
                </Typography>
                
                <DatePicker
                  label="Hasta"
                  value={to}
                  onChange={(newVal) => {
                    setTo(newVal ?? dayjs());
                    if (dateFilterMode === "active") setDateFilterMode("custom");
                  }}
                  slotProps={{ 
                    textField: { 
                      size: "small",
                      sx: { 
                        width: '150px',
                        '& .MuiInputBase-root': {
                          height: '32px',
                          fontSize: '0.8rem'
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: '0.8rem'
                        }
                      }
                    } 
                  }}
                  minDate={from}
                />
              </Box>
            </LocalizationProvider>
            
            {/* Separador */}
            <Box sx={{ width: '1px', height: '20px', backgroundColor: '#e0e0e0' }} />
            
            {/* Período seleccionado */}
            <Box sx={{ minWidth: '180px' }}>
              <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                Período:
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold',
                color: dateFilterMode === "active" ? '#6c63ff' : '#1976d2',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}>
                {formatDateRange()}
              </Typography>
            </Box>
          </Box>
          
          {/* Estado del filtro */}
          <Typography variant="caption" color="text.secondary" sx={{ 
            display: 'block', 
            mt: 1,
            p: 1,
            backgroundColor: dateFilterMode === "active" ? '#f0f4ff' : 'transparent',
            borderRadius: 1,
            border: dateFilterMode === "active" ? '1px solid #6c63ff' : 'none'
          }}>
            {dateFilterMode === "active" ? (
              <span style={{ color: '#6c63ff', fontWeight: 'bold' }}>
                ✅ Filtro aplicado al reporte "{getReportLabel(activeReport)}"
              </span>
            ) : (
              <span>
                ⚠️ Elige un reporte, luego configura las fechas y presiona <strong>"Aplicar Filtro"</strong> para filtrar el reporte actual
              </span>
            )}
          </Typography>
        </CardContent>
      </Card>

      {/* Botones de reportes */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#6c63ff' }}>
        Selecciona un tipo de reporte:
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 3,
                borderColor: '#6c63ff'
              },
              border: activeReport === 'active' ? '2px solid #6c63ff' : '1px solid #e0e0e0',
              backgroundColor: activeReport === 'active' ? '#f5f0ff' : 'white'
            }}
            onClick={() => loadReport("active")}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                backgroundColor: activeReport === 'active' ? '#6c63ff' : '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: activeReport === 'active' ? 'white' : '#1976d2'
              }}>
                <LocalActivityIcon fontSize="medium" />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: activeReport === 'active' ? 'bold' : 'normal' }}>
                Préstamos Activos
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                {dateFilterMode === "active" ? (
                  <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Con filtro: {formatDateRange()}
                  </span>
                ) : "Todos los préstamos en curso"}
              </Typography>
              
              {activeReport === 'active' && (
                <Box sx={{ 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  borderRadius: 12,
                  px: 1.5,
                  py: 0.5,
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  ✓ SELECCIONADO
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 3,
                borderColor: '#6c63ff'
              },
              border: activeReport === 'debt' ? '2px solid #6c63ff' : '1px solid #e0e0e0',
              backgroundColor: activeReport === 'debt' ? '#f5f0ff' : 'white'
            }}
            onClick={() => loadReport("debt")}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                backgroundColor: activeReport === 'debt' ? '#6c63ff' : '#ffebee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: activeReport === 'debt' ? 'white' : '#d32f2f'
              }}>
                <PeopleIcon fontSize="medium" />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: activeReport === 'debt' ? 'bold' : 'normal' }}>
                Clientes con Deudas
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                Siempre muestra estado actual
                <br/>
                <span style={{ color: '#f57c00', fontWeight: 'bold' }}>(Sin filtro de fecha)</span>
              </Typography>
              
              {activeReport === 'debt' && (
                <Box sx={{ 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  borderRadius: 12,
                  px: 1.5,
                  py: 0.5,
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  ✓ SELECCIONADO
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'translateY(-4px)', 
                boxShadow: 3,
                borderColor: '#6c63ff'
              },
              border: activeReport === 'top' ? '2px solid #6c63ff' : '1px solid #e0e0e0',
              backgroundColor: activeReport === 'top' ? '#f5f0ff' : 'white'
            }}
            onClick={() => loadReport("top")}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Box sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                backgroundColor: activeReport === 'top' ? '#6c63ff' : '#e8f5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: activeReport === 'top' ? 'white' : '#2e7d32'
              }}>
                <TrendingUpIcon fontSize="medium" />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 0.5, fontWeight: activeReport === 'top' ? 'bold' : 'normal' }}>
                Top Herramientas
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                {dateFilterMode === "active" ? (
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    Período: {formatDateRange()}
                  </span>
                ) : "Todo el historial disponible"}
              </Typography>
              
              {activeReport === 'top' && (
                <Box sx={{ 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  borderRadius: 12,
                  px: 1.5,
                  py: 0.5,
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  ✓ SELECCIONADO
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Errores */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError("")}>
              Cerrar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Generando reporte...</Typography>
          <Typography variant="caption" color="text.secondary">
            {activeReport === 'active' && "Cargando préstamos activos"}
            {activeReport === 'top' && "Generando ranking de herramientas"}
            {activeReport === 'debt' && "Buscando clientes con deudas"}
          </Typography>
        </Box>
      )}

      {/* Tabla de datos */}
      {showResults && (
        <Card sx={{ 
          border: '1px solid #e0e0e0', 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '400px'
        }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Título del reporte */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#6c63ff' }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dateFilterMode === "active" 
                    ? `✅ Filtrado por: ${formatDateRange()}` 
                    : "⚠️ Sin filtros de fecha aplicados"} • Total: {data.length} registros
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Imprimir reporte">
                  <IconButton 
                    onClick={() => window.print()}
                    size="small"
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Exportar a CSV">
                  <IconButton 
                    onClick={exportToCSV}
                    size="small"
                    color="primary"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Recargar reporte">
                  <IconButton 
                    onClick={() => loadReport(activeReport)}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {renderTable()}
            </Box>

            {/* Pie de tabla */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid #e0e0e0',
              flexShrink: 0
            }}>
              <Typography variant="body2" color="text.secondary">
                {data.length} {data.length === 1 ? 'registro' : 'registros'} mostrados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generado el {dayjs().format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Sin datos */}
      {!loading && title && data.length === 0 && (
        <Card sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#fafafa',
          border: '1px dashed #e0e0e0',
          mt: 2
        }}>
          <CardContent>
            <Box sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }}>
              {title.includes("Préstamos") && <LocalActivityIcon fontSize="inherit" />}
              {title.includes("Clientes") && <PeopleIcon fontSize="inherit" />}
              {title.includes("Herramientas") && <TrendingUpIcon fontSize="inherit" />}
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hay datos para mostrar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dateFilterMode === "active" 
                ? `No se encontraron registros para el período ${formatDateRange()}`
                : "No se encontraron registros con los criterios actuales"}
            </Typography>
            {dateFilterMode === "active" && (
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setDateFilterMode("none");
                  loadReport(activeReport);
                }}
              >
                Intentar sin filtro de fecha
              </Button>
            )}
          </CardContent>
        </Card>
      )}

     {/* Estado inicial */}
      {!loading && !title && data.length === 0 && (
        <Card sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#fafafa',
          border: '1px dashed #e0e0e0',
          mt: 2
        }}>
          <CardContent>
            <Box sx={{ fontSize: 60, color: '#e0e0e0', mb: 2, display: 'flex', justifyContent: 'center' }}>
              <TrendingUpIcon fontSize="inherit" />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Selecciona un reporte
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Haz clic en una de las tarjetas de arriba para generar un reporte
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Botones de acciones - SOLO Exportar si hay datos */}
      {hasData && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 3, 
          pt: 3, 
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button 
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            variant="contained"
            size="medium"
            sx={{ 
              backgroundColor: '#2e7d32',
              '&:hover': { backgroundColor: '#1b5e20' }
            }}
          >
            Exportar
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ReportView;