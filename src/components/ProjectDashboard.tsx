import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Divider,
  Badge,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  InsertChart as DiagramIcon,
  AccountTree as FlowIcon,
  SmartToy as AgentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useProject } from '../doc-flow-kit/ProjectContext';
import { DocRef } from '../doc-flow-kit/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `project-tab-${index}`,
    'aria-controls': `project-tabpanel-${index}`,
  };
};

interface ProjectDashboardProps {
  onOpenDiagram: (docId: string) => void;
  onOpenFlow: (docId: string) => void;
  onOpenAgent: (docId: string) => void;
  onCreateDiagram: () => void;
  onCreateFlow: () => void;
  onCreateAgent: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  onOpenDiagram,
  onOpenFlow,
  onOpenAgent,
  onCreateDiagram,
  onCreateFlow,
  onCreateAgent,
}) => {
  const { project } = useProject();
  const [tabValue, setTabValue] = useState(0);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const theme = useTheme();

  if (!project) {
    return <Typography>No project loaded</Typography>;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const openRenameDialog = () => {
    setNewProjectName(project.content.name);
    setIsRenameDialogOpen(true);
  };

  const closeRenameDialog = () => {
    setIsRenameDialogOpen(false);
  };

  const handleRename = () => {
    // Implement project rename functionality
    // Call saveProject with updated name
    closeRenameDialog();
  };

  // Filter documents by type
  const diagrams = project.content.documents.filter(doc => doc.docType === 'Diagram');
  const flows = project.content.documents.filter(doc => doc.docType === 'Flow');
  const agents = project.content.documents.filter(doc => doc.docType === 'Agent');

  // Render document card
  const renderDocumentCard = (doc: DocRef, type: 'Diagram' | 'Flow' | 'Agent') => {
    const handleOpen = () => {
      switch (type) {
        case 'Diagram':
          onOpenDiagram(doc.docId);
          break;
        case 'Flow':
          onOpenFlow(doc.docId);
          break;
        case 'Agent':
          onOpenAgent(doc.docId);
          break;
      }
    };

    const getIcon = () => {
      switch (type) {
        case 'Diagram':
          return <DiagramIcon />;
        case 'Flow':
          return <FlowIcon />;
        case 'Agent':
          return <AgentIcon />;
      }
    };

    const getColor = () => {
      switch (type) {
        case 'Diagram':
          return theme.palette.primary.main;
        case 'Flow':
          return theme.palette.secondary.main;
        case 'Agent':
          return '#FF5722'; // Orange for agents
      }
    };

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box color={getColor()} mr={1}>
              {getIcon()}
            </Box>
            <Typography variant="h6" component="div" noWrap>
              {doc.title || `Untitled ${type}`}
            </Typography>
          </Box>
          <Typography color="text.secondary" variant="body2">
            {type}
          </Typography>
          <Chip 
            label={`ID: ${doc.docId.substring(0, 8)}...`} 
            size="small" 
            sx={{ mt: 1 }} 
          />
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleOpen}>Open</Button>
          <Box flexGrow={1} />
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {project.content.name}
        </Typography>
        <IconButton onClick={openRenameDialog} color="primary" sx={{ mr: 1 }}>
          <EditIcon />
        </IconButton>
        <IconButton color="primary">
          <SettingsIcon />
        </IconButton>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="project tabs"
        >
          <Tab
            icon={<Badge badgeContent={diagrams.length} color="primary"><DiagramIcon /></Badge>}
            label="Diagrams"
            {...a11yProps(0)}
          />
          <Tab
            icon={<Badge badgeContent={flows.length} color="secondary"><FlowIcon /></Badge>}
            label="Flows"
            {...a11yProps(1)}
          />
          <Tab
            icon={<Badge badgeContent={agents.length} color="error"><AgentIcon /></Badge>}
            label="Agents"
            {...a11yProps(2)}
          />
        </Tabs>

        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Diagrams
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateDiagram}
            >
              New Diagram
            </Button>
          </Box>

          {diagrams.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
              No diagrams yet. Create one to get started!
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {diagrams.map((doc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc.docId}>
                  {renderDocumentCard(doc, 'Diagram')}
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Flows
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={onCreateFlow}
            >
              New Flow
            </Button>
          </Box>

          {flows.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
              No flows yet. Create one to get started!
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {flows.map((doc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc.docId}>
                  {renderDocumentCard(doc, 'Flow')}
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">
              Agents
            </Typography>
            <Button
              variant="contained"
              sx={{ bgcolor: '#FF5722' }}
              startIcon={<AddIcon />}
              onClick={onCreateAgent}
            >
              New Agent
            </Button>
          </Box>

          {agents.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
              No agents yet. Create one to get started!
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {agents.map((doc) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc.docId}>
                  {renderDocumentCard(doc, 'Agent')}
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onClose={closeRenameDialog}>
        <DialogTitle>Rename Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRenameDialog}>Cancel</Button>
          <Button onClick={handleRename} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectDashboard; 