import React, { useState, useContext } from "react";
import { db, auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, collection, doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import UserContext from "../UserContext";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import './dashboardCard.css'

function CreateAccount() {
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [companyAddress, setCompanyAddress] = useState(user.companyAddress);
    const [managementName, setManagementName] = useState(user.managementName);
    const [companyContact, setCompanyContact] = useState(user.contact);
    const [selectedRadioOption, setSelectedRadioOption] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
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
    const handlelogin = () => {
        navigate("/");
    };
    const handleFeed = () => {
        navigate("/Feedback");
    };
    const handleViewProfile = () => {
        navigate("/Profiles");
    };
    const handleRevenues = () => {
        navigate("/Tracks");
    };
    const handleButtonClick = () => {
        navigate("/TicketInfo");
    };
    const handleRegister = () => {
        navigate("/AgentRegistration");
    };
    const handleAgentSchedule = () => {
        navigate("/AgentSchedule");
    };
    const listItemHoverStyle = {
        backgroundColor: "#003851",
    };
    const customListItemStyle = {
        border: "none", // Remove border from list items
        backgroundColor: "#FFFFFF",
    };
    const navigate = useNavigate();
    const collectionRef = collection(db, "agents");

    const handleBack = () => {
        navigate("/Dashboard");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "agents", user.uid), {
                uid: user.uid,
                firstName,
                lastName,
                email,
                phoneNumber,
                address,
                password,
                managementName,
                companyAddress,
                companyContact,
                selectedRadioOption,
            });

            console.log("Document successfully written and user registered!");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setPhoneNumber("");
            setAddress("");
            setSelectedRadioOption("");

            alert("Successfully registered!");
            navigate("/Dashboard");
        } catch (error) {
            console.error("Error creating account:", error);
            alert(error.message);
        }
    };

    const handleRadioChange = (e) => {
        setSelectedRadioOption(e.target.value);
    };

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundColor: "white",
    };

    const formContainerStyle = {
        backdropFilter: "blur(3px)",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        width: "400px",
        marginTop: "50px",
    };

    const inputGroupStyle = {
        marginBottom: "15px",
        marginRight: "10px",
        marginTop: "10px",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
        fontFamily: "Georgina",
    };

    const buttonStyle = {
        width: "100%",
        padding: "12px",
        backgroundColor: "rgba(4, 55,55, 0.7)",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "18px",
    };

    return (
        
        <section
            style={{
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    minHeight: "100vh",
                    backgroundColor: "white",
                }}
            >
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
                <div className="container">
                    <Link className="navbar-brand" to="/Dashboard" style={{ fontSize: "25px" }}>
                        SpotWise
                    </Link>
                    
                    <p style={styles.welcomeMessage}>
                        <DropdownButton alignRight variant="outline-light" title={<FaUserCircle style={styles.icon} />} id="dropdown-menu">
                            <Dropdown.Item href="Dashboard">
                                <img src="dashboard.jpg" alt="Operator Dashboard Logo" style={{ width: "20px", marginRight: "10px" }} />
                                Dashboard
                            </Dropdown.Item>
                            <Dropdown.Item href="AgentSchedule">
                                <img src="calendar.webp" alt="Agent Schedule" style={{ width: "20px", marginRight: "10px" }} />
                                Agent Schedule{" "}
                            </Dropdown.Item>
                            <Dropdown.Item href="AgentRegistration">
                                <img src="registerA.jpg" alt="Agent Register" style={{ width: "20px", marginRight: "10px" }} />
                                Register Ticket Operator
                            </Dropdown.Item>
                            <Dropdown.Item href="Profiles">
                                <img src="pofile.jpg" alt="Management Details" style={{ width: "20px", marginRight: "10px" }} />
                                View Profile
                            </Dropdown.Item>
                            <Dropdown.Item href="TicketInfo">
                                <img src="infoPark.png" alt="Parking Info" style={{ width: "20px", marginRight: "10px" }} />
                                Ticket Information
                            </Dropdown.Item>
                            <Dropdown.Item href="Feedback">
                                <img src="feedback.jpg" alt="Feedback" style={{ width: "20px", marginRight: "10px" }} />
                                Feedback
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/">
                                <img src="logout.png" alt="Operator Logout Logo" style={{ width: "20px", marginRight: "10px" }} />
                                Logout
                            </Dropdown.Item>
                        </DropdownButton>
                    </p>
                </div>
            </nav>
       
          
                    <p style={styles.welcomeMessage}>
                        <DropdownButton alignRight variant="outline-light" title={<FaUserCircle style={styles.icon} />} id="dropdown-menu">
                            <Dropdown.Item href="Dashboard">
                                <img src="dashboard.jpg" alt="Operator Dashboard Logo" style={{ width: "20px", marginRight: "10px" }} />
                                Dashboard
                            </Dropdown.Item>
                            <Dropdown.Item href="AgentSchedule">
                                <img src="calendar.webp" alt="Agent Schedule" style={{ width: "20px", marginRight: "10px" }} />
                                Agent Schedule{" "}
                            </Dropdown.Item>
                            <Dropdown.Item href="TicketInfo">
                                <img src="infoPark.png" alt="Parking Info" style={{ width: "20px", marginRight: "10px" }} />
                                Ticket Information
                            </Dropdown.Item>
                            <Dropdown.Item href="Profiles">
                                <img src="pofile.jpg" alt="Management Details" style={{ width: "20px", marginRight: "10px" }} />
                                View Profile
                            </Dropdown.Item>
                            <Dropdown.Item href="Tracks">
                                <img src="management.jpg" alt="Management Details" style={{ width: "20px", marginRight: "10px" }} />
                                Management Details
                            </Dropdown.Item>
                            <Dropdown.Item href="Feedback">
                                <img src="feedback.jpg" alt="Feedback" style={{ width: "20px", marginRight: "10px" }} />
                                Feedback
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item href="/">
                                <img src="logout.png" alt="Operator Logout Logo" style={{ width: "20px", marginRight: "10px" }} />
                                Logout
                            </Dropdown.Item>
                        </DropdownButton>
                  </p>
                  <div className="admin-dashboard"> {/* Adjusted marginTop to account for navbar */}
        <div className="sidebar">
            <div className="admin-container">
            </div>
            <div class="wrapper">
                <div class="side">
                    <div>
                                {profileImageUrl ? <MDBCardImage src={profileImageUrl} alt="Operator Profile Logo" className="rounded-circle" style={{ width: "70px"}} fluid /> : <MDBCardImage src="default_placeholder.jpg" alt="Default Profile Logo" className="rounded-circle" style={{ width: "70px", marginTop: '-6vh' }} fluid />}
                                <p style={{ fontFamily: "Georgina", fontSize: "20px", border: "white", fontWeight: "bold", colo: 'white'}}>Administrator</p>
                                <p style={{ fontFamily: "Georgina", color: "white", fontWeight: "bold", fontSize: 12, marginTop: -15}}>
                                    {managementName}                 
                                </p>
                                </div>            
                    <h2>Menu</h2>
                    <ul>
                        <li><a href="Dashboard"><i class="fas fa-home"></i>Home</a></li>
                        <li><a href='AgentRegistration'><i class="fas fa-user"></i>Account Management</a></li>
                        <li><a href='TicketInfo'><i class="fas fa-address-card"></i>Ticket Management</a></li>
                        <li><a href='Tracks'><i class="fas fa-project-diagram"></i>Management Details</a></li>
                        <li><a href="AgentSchedule"><i class="fas fa-blog"></i>Schedule Management</a></li>
                        <li><a href="Profiles"><i class="fas fa-blog"></i>Profile</a></li>
                        <li><a href="Feedback"><i class="fas fa-blog"></i>Feedback</a></li>
                        <li><a href="/"><i className="fas fa-sign-out-alt" style={{ color: 'red' }}></i>Logout</a></li>
                    </ul>

                    
                </div>
                </div>
              </div>
                
   
            <MDBContainer className="py-4">
                <MDBRow>
                  
   
                    <MDBCol lg="8">
                        <MDBCard style={{ marginTop: "45px",  backgroundColor: "#fbfbfb"}}>
                            <MDBCardBody>
                                <h4 style={{ textAlign: "center", marginBottom: "20px", marginTop: "25px", fontSize: "25px", fontFamily: "Georgina", color: "black" , fontWeight: "bold"}}>Create Operator Account</h4>
                                <form onSubmit={handleSubmit}>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={{ marginRight: "20px", fontFamily: "Georgina", color: "black" ,fontSize: "18px"}}>
                                            <input type="radio" value="Male" checked={selectedRadioOption === "Male"} onChange={handleRadioChange} /> Male
                                        </label>
                                        <label style={{ fontFamily: "Georgina", color: "black" , fontSize: "18px"}}>
                                            <input type="radio" value="Female" checked={selectedRadioOption === "Female"} onChange={handleRadioChange} /> Female
                                        </label>
                                    </div>
                                    <button type="submit" style={buttonStyle}>
                                        Register
                                    </button>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            </div>
        </section>
    );
}

export default CreateAccount;
