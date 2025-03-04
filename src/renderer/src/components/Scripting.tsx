import { useState, JSX } from "react";
import { Container, Typography, List, ListItemButton, ListItemText, Collapse, Button, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function Scripting(): JSX.Element
{
    const items = [
        { id: 1, name: "Item 1", details: "Details about Item 1" },
        { id: 2, name: "Item 2", details: "Details about Item 2" },
        { id: 3, name: "Item 3", details: "Details about Item 3" }
    ];

    const[expanded, setExpanded] = useState<number | null>(null)

    const handleToggle = (id: number): void =>
    {
        setExpanded(expanded === id ? null : id);
    };

    return (
        <>
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Expandable List
                </Typography>
                <List>
                    {items.map((item) => (
                        <Box key={item.id}>
                            <ListItemButton onClick={() => handleToggle(item.id)}>
                                <ListItemText primary={item.name} />
                                {expanded === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItemButton>
                            <Collapse in={expanded === item.id} timeout="auto" unmountOnExit>
                                <Box sx={{ pl: 4, pb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.details}
                                    </Typography>
                                    <Button variant="contained" size="small" sx={{ mt: 1 }}>
                                        Action
                                    </Button>
                                </Box>
                            </Collapse>
                        </Box>
                    ))}
                </List>
            </Container>
        </>
    )
}