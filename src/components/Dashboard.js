import React, { useContext, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChartColumn, faAddressCard, faPlus, faCar, faUser, faCoins, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../UserContext";
import { auth, db } from "../config/firebase";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";

const listItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    border: "none",
    boxShadow: "none",
};
const customListItemStyle = {
    border: "none", // Remove border from list items
    backgroundColor: "#FFFFFF",
};
const listItemHoverStyle = {
    backgroundColor: "#003851",
};

const Establishment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [parkingLogs, setParkingLogs] = useState([]);
    const [managementName, setManagementName] = useState(user.managementName || "");
    const [address, setAddress] = useState(user.companyAddress || "");
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSlots, setTotalSlots] = useState(user.totalSlots || "");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const parkingPay = user.parkingPay;
    const totalRevenues = totalUsers * parkingPay;
    const updateInterval = 1000;

    const userDocRef = auth.currentUser ? doc(db, "establishments", auth.currentUser.uid) : null;

    useEffect(() => {
        if (userDocRef) {
            const fetchImageUrl = async () => {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setProfileImageUrl(userData.profileImageUrl);
                } else {
                    console.log("No such document!");
                }
            };

            fetchImageUrl().catch(console.error);
        }
    }, [userDocRef]);

    useEffect(() => {
        let interval;

        const fetchParkingLogs = async () => {
            try {
                const currentUserManagementName = user.managementName;
                const logsCollectionRef = collection(db, "logs");

                const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));

                const querySnapshot = await getDocs(q);
                const logs = [];
                querySnapshot.forEach((doc) => {
                    logs.push({ id: doc.id, ...doc.data() });
                });

                const sortedLogs = logs.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn)).slice(0, 3);
                console.log("Logs fetched:", sortedLogs);
                setParkingLogs(sortedLogs);
            } catch (error) {
                console.error("Error fetching parking logs: ", error);
            }
        };

        fetchParkingLogs();

        interval = setInterval(fetchParkingLogs, updateInterval);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const fetchParkingLogs = async () => {
            try {
                const currentUserManagementName = user.managementName;
                const logsCollectionRef = collection(db, "logs");
                const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));

                const querySnapshot = await getDocs(q);
                const logs = [];
                querySnapshot.forEach((doc) => {
                    logs.push({ id: doc.id, ...doc.data() });
                });
                setParkingLogs(logs);
                const totalUser = logs.length;
                setTotalUsers(totalUser);
            } catch (error) {
                console.error("Error fetching parking logs: ", error);
            }
        };

        if (user && user.managementName) {
            fetchParkingLogs();
        }
    }, [user, db]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (auth.currentUser) {
                    const userId = auth.currentUser.uid;

                    const doc = await db.collection("establishments").doc(userId).get();

                    if (doc.exists) {
                        const userData = doc.data();

                        setManagementName(userData.managementName || "");
                        setAddress(userData.address || "");
                    } else {
                        console.log("No user data found!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        fetchUserData();
    }, []);
    const establishmentData = location.state;

    const handleButtonClick = () => {
        navigate("/TicketInfo");
    };

    const handleViewProfile = () => {
        navigate("/Profiles");
    };
    const handlelogin = () => {
        navigate("/");
    };
    const handleAgentSchedule = () => {
        navigate("/AgentSchedule");
    };

    const handleRevenues = () => {
        navigate("/Tracks");
    };

    const handleRegister = () => {
        navigate("/AgentRegistration");
    };

    const handleFeed = () => {
        navigate("/Feedback");
    };

    const handleProfile = () => {
        navigate("/Profiles");
    };
    const styles = {
        welcomeMessage: {
            position: "absolute",
            top: "10px",
            right: "10px",
            margin: "0",
            color: "#fff",
            fontFamily: "Rockwell, sans-serif",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        },
        icon: {
            marginRight: "5px",
        },
    };

    return (
        <section
            style={{
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh",
                backgroundColor: "white", // Set a background color in case the image is not fully loaded
            }}
        >
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
                <div className="container">
                    <Link className="navbar-brand" to="/Dashboard" style={{ fontSize: "25px" }}>
                        SpotWise
                    </Link>
                    <p style={styles.welcomeMessage}>
                        <DropdownButton alignRight variant="outline-light" title={<FaUserCircle style={styles.icon} />} id="dropdown-menu">
                            <Dropdown.Item href="/">
                                <img src="logout.png" alt="Operator Logout Logo" style={{ width: "20px", marginRight: "10px" }} />
                                Logout
                            </Dropdown.Item>
                        </DropdownButton>
                    </p>
                </div>
            </nav>

            <MDBContainer className="py-5">
                <MDBRow>
                    <MDBCol lg="4">
                        <MDBCard style={{ marginTop: "45px", color: "#fff" }}>
                            <MDBCardBody className="text-center">
                                <p style={{ fontFamily: "Georgina", fontSize: "25px", color: "black", border: "white", fontWeight: "bold" }}>Administrator</p>
                                {profileImageUrl ? <MDBCardImage src={profileImageUrl} alt="Operator Profile Logo" className="rounded-circle" style={{ width: "70px" }} fluid /> : <MDBCardImage src="default_placeholder.jpg" alt="Default Profile Logo" className="rounded-circle" style={{ width: "70px" }} fluid />}
                                <p className="text-muted mb-1" style={{ fontFamily: "Georgina", marginTop: "15px", color: "black", fontWeight: "bold" }}>
                                    {managementName}
                                </p>
                                <p className="text-muted mb-4" style={{ fontFamily: "Georgina", fontWeight: "bold" }}>
                                    {address}
                                </p>
                            </MDBCardBody>

                            <MDBCard className="mb-4 mb-lg-0" style={{ marginTop: "40px", boxShadow: "none", border: "none" }}>
                                <MDBCardBody className="p-0">
                                    <MDBListGroup
                                        flush
                                        className="rounded-3"
                                        style={{
                                            border: "none",
                                            borderRadius: "none",
                                            boxShadow: "none",
                                        }}
                                    >
                                        <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle }} hover className="d-flex justify-content-between align-items-center p-3" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}>
                                            <MDBCardText onClick={() => handleAgentSchedule()} style={{ fontFamily: "Georgina", fontSize: "18px", color: "black" }}>
                                                <img src="calendar.webp" alt="Calendar" style={{ width: "25px", marginRight: "30px" }} />
                                                Agent Schedule
                                            </MDBCardText>
                                        </MDBListGroupItem>
                                        <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle }} hover className="d-flex justify-content-between align-items-center p-3" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}>
                                            <MDBCardText onClick={() => handleRegister()} style={{ fontFamily: "Georgina", fontSize: "18px", color: "black" }}>
                                                <img src="registerA.jpg" alt="User" style={{ width: "25px", marginRight: "30px" }} />
                                                Register Ticket Operator
                                            </MDBCardText>
                                        </MDBListGroupItem>

                                        <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle }} hover className="d-flex justify-content-between align-items-center p-3" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}>
                                            <MDBCardText onClick={() => handleViewProfile()} style={{ fontFamily: "Georgina", fontSize: "18px", color: "black" }}>
                                                <img src="pofile.jpg" alt="Profile" style={{ width: "25px", marginRight: "30px" }} />
                                                View Profile
                                            </MDBCardText>
                                        </MDBListGroupItem>
                                        <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle }} hover className="d-flex justify-content-between align-items-center p-3" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}>
                                            <MDBCardText onClick={() => handleRevenues()} style={{ fontFamily: "Georgina", fontSize: "18px", color: "black" }}>
                                                <img src="management.jpg" alt="Management" style={{ width: "25px", marginRight: "30px" }} />
                                                Management Details
                                            </MDBCardText>
                                        </MDBListGroupItem>
                                        <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle }} hover className="d-flex justify-content-between align-items-center p-3" onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}>
                                            <MDBCardText onClick={() => handleFeed()} style={{ fontFamily: "Georgina", fontSize: "18px", color: "black" }}>
                                                <img src="feedback.jpg" alt="Feedback" style={{ width: "25px", marginRight: "30px" }} />
                                                Feedback
                                            </MDBCardText>
                                        </MDBListGroupItem>
                                        <Button onClick={handlelogin} style={{ fontFamily: "Georgina", width: "80px", backgroundColor: "rgba(4, 55,55, 0.7)", marginLeft: "80px", marginTop: "75px", border: "none" }}>
                                            Logout
                                        </Button>
                                    </MDBListGroup>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCard>
                    </MDBCol>

                    <MDBCol lg="8">
                        <div className="row mt-3">
                            <h1 style={{ color: "black" }}> Dashboard </h1>

                            <div className="col-md-3">
                                <Card className="mb-3" style={{ height: "220px", color: "#fff", boxShadow: "none", border: "none" }}>
                                    <Card.Body>
                                        <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black" }}>
                                            <FontAwesomeIcon icon={faCar} /> Parking Availability
                                        </Card.Title>
                                        <Card.Text style={{ textAlign: "center", fontFamily: "Copperplate", fontSize: "20px", color: "black" }}>{user.totalSlots}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="col-md-3">
                                <Card className="mb-3" style={{ height: "220px", color: "black", boxShadow: "none", border: "none" }}>
                                    <Card.Body>
                                        <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black" }}>
                                            <FontAwesomeIcon icon={faCoins} /> Total Revenues
                                        </Card.Title>
                                        <Card.Text style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "20px", color: "black" }}>{totalRevenues}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="col-md-3">
                                <Card className="mb-3" style={{ height: "220px", border: "none", boxShadow: "none", border: "none" }}>
                                    <Card.Body>
                                        <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black" }}>
                                            <FontAwesomeIcon icon={faUser} /> Total Users Today
                                        </Card.Title>
                                        <Card.Text style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "20px", color: "black" }}>{totalUsers}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                            <div className="col-md-3">
                                <Card className="mb-3" style={{ height: "220px", border: "none", boxShadow: "none", border: "none" }}>
                                    <Card.Body>
                                        <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black" }}>
                                            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Parking Payment
                                        </Card.Title>
                                        <Card.Text style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "20px", color: "black" }}>{user.parkingPay}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                        <MDBCard style={{ marginTop: "50px" }}>
                            <MDBCardBody>
                                <MDBCardText className="mb-4" style={{ fontFamily: "Georgina", color: "white", fontSize: "18px" }}>
                                    <FontAwesomeIcon icon={faUser} style={{ color: "black" }} />
                                    <span className="font-italic me-1" style={{ color: "black", fontWeight: "bold" }}>
                                        {" "}
                                        Recent Parking User
                                    </span>
                                </MDBCardText>
                                <MDBRow>
                                    {parkingLogs.map((log) => (
                                        <MDBCol md="4" key={log.id}>
                                            <MDBCard>
                                                <MDBCardBody style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                                    <MDBCardText>Name: {log.name} </MDBCardText>
                                                    <MDBCardText>Address: {log.address}</MDBCardText>
                                                    <MDBCardText>Vehicle: {log.car}</MDBCardText>
                                                    <MDBCardText>Vehicle Plate: {log.carPlateNumber}</MDBCardText>
                                                    <MDBCardText style={{ color: "green" }}>Time in: {log.timeOut && log.timeIn.toDate().toLocaleString()}</MDBCardText>
                                                    <MDBCardText style={{ color: "red" }}>Time out: {log.timeOut && log.timeOut.toDate().toLocaleString()}</MDBCardText>
                                                </MDBCardBody>
                                            </MDBCard>
                                        </MDBCol>
                                    ))}
                                </MDBRow>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </section>
    );
};

export default Establishment;
