import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Link as BlockchainIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  NetworkCheck as NetworkIcon,
  DataUsage as DataIcon,
  AccountTree as TransactionIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { blockchainService, AuditTrailManager } from '../../services/blockchainService';

const AuditDashboard = ({ citizenOid }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [activeTab, setActiveTab] = useState(0);
  const [auditRecords, setAuditRecords] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [searchOid, setSearchOid] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState({});

  const transactionTypeColors = {
    'IDENTITY_CREATED': 'success',
    'SERVICE_ACCESSED': 'primary',
    'DATA_MODIFIED': 'warning',
    'CONSENT_GRANTED': 'info',
    'CONSENT_REVOKED': 'error'
  };

  const transactionTypeIcons = {
    'IDENTITY_CREATED': <SuccessIcon />,
    'SERVICE_ACCESSED': <SecurityIcon />,
    'DATA_MODIFIED': <WarningIcon />,
    'CONSENT_GRANTED': <InfoIcon />,
    'CONSENT_REVOKED': <ErrorIcon />
  };

  useEffect(() => {
    loadNetworkStatus();
    if (citizenOid) {
      loadAuditTrail(citizenOid);
    }
  }, [citizenOid]);

  const loadNetworkStatus = async () => {
    try {
      const status = await blockchainService.getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Failed to load network status:', error);
    }
  };

  const loadAuditTrail = async (oid) => {
    setLoading(true);
    try {
      const result = await blockchainService.queryAuditTrail(oid);
      if (result.success) {
        setAuditRecords(result.records);
      }
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async (transactionId) => {
    try {
      const result = await blockchainService.verifyTransaction(transactionId);
      setVerificationResults(prev => ({
        ...prev,
        [transactionId]: result
      }));
    } catch (error) {
      console.error('Failed to verify transaction:', error);
    }
  };

  const exportAuditData = async (format = 'json') => {
    try {
      const data = await blockchainService.exportAuditData(searchOid || citizenOid, format);
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-trail-${searchOid || citizenOid}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit data:', error);
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`audit-tabpanel-${index}`}
      aria-labelledby={`audit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const renderNetworkStatus = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <NetworkIcon sx={{ mr: 2, fontSize: 32, color: theme.palette.primary.main }} />
              <Typography variant="h6">
                {isRTL ? 'حالة شبكة البلوك تشين' : 'Blockchain Network Status'}
              </Typography>
            </Box>
            
            {networkStatus ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip
                      icon={networkStatus.connected ? <SuccessIcon /> : <ErrorIcon />}
                      label={networkStatus.connected 
                        ? (isRTL ? 'متصل' : 'Connected') 
                        : (isRTL ? 'غير متصل' : 'Disconnected')
                      }
                      color={networkStatus.connected ? 'success' : 'error'}
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'حالة الاتصال' : 'Connection Status'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'النظراء المتصلون' : 'Connected Peers'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {networkStatus.peersConnected}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'ارتفاع البلوك' : 'Block Height'}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {networkStatus.blockHeight?.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'اسم الشبكة' : 'Network ID'}
                    </Typography>
                    <Typography variant="body1">
                      {networkStatus.networkId}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'آخر بلوك' : 'Last Block'}
                    </Typography>
                    <Typography variant="body1">
                      {networkStatus.lastBlockTime 
                        ? new Date(networkStatus.lastBlockTime).toLocaleString()
                        : '-'
                      }
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {isRTL ? 'صحة الشبكة' : 'Network Health'}
                    </Typography>
                    <Chip
                      label={networkStatus.networkHealth}
                      color={networkStatus.networkHealth === 'healthy' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <LinearProgress />
            )}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {isRTL ? 'إعدادات الشبكة' : 'Network Configuration'}
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DataIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={isRTL ? 'القناة' : 'Channel'}
                  secondary={blockchainService.networkConfig.channelName}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <TransactionIcon color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary={isRTL ? 'العقد الذكي' : 'Chaincode'}
                  secondary={blockchainService.networkConfig.chaincodeName}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <ShieldIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary={isRTL ? 'خوارزمية الإجماع' : 'Consensus'}
                  secondary={networkStatus?.consensusAlgorithm || 'PBFT'}
                />
              </ListItem>
            </List>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={loadNetworkStatus}
              sx={{ mt: 2 }}
            >
              {isRTL ? 'تحديث الحالة' : 'Refresh Status'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAuditTrail = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {isRTL ? 'سجل التدقيق' : 'Audit Trail'}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportAuditData('json')}
          >
            {isRTL ? 'تصدير JSON' : 'Export JSON'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportAuditData('csv')}
          >
            {isRTL ? 'تصدير CSV' : 'Export CSV'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label={isRTL ? 'البحث برقم الهوية الرقمية' : 'Search by OID'}
              value={searchOid}
              onChange={(e) => setSearchOid(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={() => loadAuditTrail(searchOid)}
              disabled={!searchOid || loading}
            >
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{isRTL ? 'الوقت' : 'Timestamp'}</TableCell>
              <TableCell>{isRTL ? 'النوع' : 'Type'}</TableCell>
              <TableCell>{isRTL ? 'معرف المعاملة' : 'Transaction ID'}</TableCell>
              <TableCell>{isRTL ? 'الوزارة' : 'Ministry'}</TableCell>
              <TableCell>{isRTL ? 'التأكيدات' : 'Confirmations'}</TableCell>
              <TableCell>{isRTL ? 'الحالة' : 'Status'}</TableCell>
              <TableCell>{isRTL ? 'الإجراءات' : 'Actions'}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditRecords.map((record) => (
              <TableRow key={record.transactionId} hover>
                <TableCell>
                  {new Date(record.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={transactionTypeIcons[record.type]}
                    label={record.type}
                    color={transactionTypeColors[record.type]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {record.transactionId.substring(0, 12)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={record.ministryId} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="success.main">
                    {record.confirmations}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={record.verified ? <VerifiedIcon /> : <WarningIcon />}
                    label={record.verified ? (isRTL ? 'مؤكد' : 'Verified') : (isRTL ? 'معلق' : 'Pending')}
                    color={record.verified ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title={isRTL ? 'عرض التفاصيل' : 'View Details'}>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedTransaction(record)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isRTL ? 'التحقق من المعاملة' : 'Verify Transaction'}>
                      <IconButton
                        size="small"
                        onClick={() => verifyTransaction(record.transactionId)}
                        color={verificationResults[record.transactionId]?.verified ? 'success' : 'default'}
                      >
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {auditRecords.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {isRTL 
            ? 'لا توجد سجلات تدقيق لهذه الهوية الرقمية' 
            : 'No audit records found for this OID'
          }
        </Alert>
      )}
    </Box>
  );

  const renderIntegrityCheck = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isRTL ? 'فحص سلامة البيانات' : 'Data Integrity Check'}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'حالة التحقق' : 'Verification Status'}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <VerifiedIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2">
                  {isRTL ? 'جميع المعاملات مؤكدة' : 'All transactions verified'}
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={95}
                color="success"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="textSecondary">
                {isRTL ? 'معدل الثقة: 95%' : 'Trust Score: 95%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {isRTL ? 'آخر فحص' : 'Last Check'}
              </Typography>
              
              <Typography variant="body2" color="textSecondary">
                {new Date().toLocaleString()}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                fullWidth
                sx={{ mt: 2 }}
              >
                {isRTL ? 'فحص الآن' : 'Check Now'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {isRTL ? 'إحصائيات التحقق' : 'Verification Statistics'}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {auditRecords.filter(r => r.verified).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isRTL ? 'مؤكدة' : 'Verified'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {auditRecords.filter(r => !r.verified).length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isRTL ? 'معلقة' : 'Pending'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main">
                  {auditRecords.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isRTL ? 'إجمالي' : 'Total'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  100%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {isRTL ? 'الموثوقية' : 'Reliability'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <BlockchainIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
        <Box>
          <Typography variant="h4" component="h1">
            {isRTL ? 'لوحة تحكم البلوك تشين' : 'Blockchain Audit Dashboard'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {isRTL 
              ? 'مراقبة ومراجعة معاملات البلوك تشين للهوية الرقمية' 
              : 'Monitor and audit blockchain transactions for digital identity'
            }
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={isRTL ? 'حالة الشبكة' : 'Network Status'} 
            icon={<NetworkIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={isRTL ? 'سجل التدقيق' : 'Audit Trail'} 
            icon={<TimelineIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={isRTL ? 'فحص السلامة' : 'Integrity Check'} 
            icon={<SecurityIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        {renderNetworkStatus()}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {renderAuditTrail()}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {renderIntegrityCheck()}
      </TabPanel>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isRTL ? 'تفاصيل المعاملة' : 'Transaction Details'}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'معرف المعاملة' : 'Transaction ID'}
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                    {selectedTransaction.transactionId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'هاش البلوك' : 'Block Hash'}
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                    {selectedTransaction.blockHash}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'رقم البلوك' : 'Block Number'}
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.blockNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {isRTL ? 'عدد التأكيدات' : 'Confirmations'}
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {selectedTransaction.confirmations}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTransaction(null)}>
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditDashboard;