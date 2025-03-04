import { Box, Button, Container, Typography } from "@mui/material";
import { useState, JSX } from "react";

export default function Home(): JSX.Element
{

    const [status, setStatus] = useState("Welcome!");

    return (
        <>
            <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Status Page
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => setStatus("Action 1 executed!")}>
                        Action 1
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setStatus("Action 2 executed!")}>
                        Action 2
                    </Button>
                    <Button variant="outlined" onClick={() => setStatus("Reset to default")}>
                        Reset
                    </Button>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    {status}
                </Typography>
            </Container>
        </>
    )
}