import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import Card from "react-bootstrap/Card";

import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import UserContext from "../UserContext";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChartColumn, faAddressCard, faPlus, faCar, faUser, faCoins, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../config/firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL, listAll, list } from "firebase/storage";
import { v4 } from "uuid";

export default function EditButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.managementName || "");
    const [managementName, setManagementName] = useState(user.managementName || "");
    const [address, setAddress] = useState(user.companyAddress || "");
    const [companyContact, setCompanyContact] = useState(user.contact || "");
    const [companyEmail, setCompanyEmail] = useState(user.email || "");
    const [companyName, setCompanyName] = useState(user.management || "");
    const [profileImageUrl, setProfileImageUrl] = useState("");

    const userDocRef = auth.currentUser ? doc(db, "establishments", auth.currentUser.uid) : null;
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
    const handleButtonClick = () => {
        navigate("/TicketInfo");
    };

    const handleViewProfile = () => {
        navigate("/Profiles");
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
    const customListItemStyle = {
        border: "none", // Remove border from list items
        backgroundColor: "#FFFFFF",
    };

    const [imageUpload, setImageUpload] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    const saveProfileImageUrl = async (url) => {
        if (userDocRef) {
            await updateDoc(userDocRef, {
                profileImageUrl: url,
            });
        }
    };

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
    const handlelogin = () => {
        navigate("/");
    };
    const listItemHoverStyle = {
        backgroundColor: "#003851",
    };
    const imagesListRef = ref(storage, "images/");
    const uploadFile = () => {
        if (imageUpload && auth.currentUser) {
            const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
            uploadBytes(imageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    setProfileImageUrl(url);
                    saveProfileImageUrl(url);
                });
            });
        }
    };

    useEffect(() => {
        listAll(imagesListRef).then((response) => {
            response.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                    setImageUrls((prev) => [...prev, url]);
                });
            });
        });
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (auth.currentUser) {
                    const userId = auth.currentUser.uid;
                    const currentUserManagementName = user.managementName;

                    const doc = await db.collection("establishments").doc(userId).get();

                    if (doc.exists) {
                        const userData = doc.data();

                        setName(userData.managementName || "");
                        setAddress(userData.address || "");
                        setCompanyContact(userData.contact || "");
                        setCompanyName(userData.managementName || "");
                        setCompanyEmail(userData.email || "");
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

    const updateUserData = async () => {
        try {
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(db, "establishments", userId);

                const updatedData = {
                    managementName: name,
                    address: address,
                    contact: companyContact,
                    email: companyEmail,
                };

                await updateDoc(userDocRef, updatedData);

                console.log("User data updated/created successfully!");
            } else {
                console.error("User not authenticated");
            }
        } catch (error) {
            console.error("Error updating user data: ", error);
        }
    };

    const toggleEditing = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = () => {
        console.log(auth.currentUser);
        setIsEditing(false);
        updateUserData();
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
    const imageSizeStyles = {
        width: "100%",
        height: "200px", // Set the desired height for all images
        objectFit: "cover",
        borderRadius: "10px", // Set the desired border radius
    };

    return (
        <section style={{ backgroundSize: "cover", backgroundRepeat: "no-repeat", minHeight: "100vh", backgroundColor: "white" }}>
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
                <div className="container">
                <Link className="navbar-brand" to="/Dashboard" style={{ fontSize: '25px'}}>
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
                            <Dropdown.Item href="TicketInfo">
                                <img src="infoPark.png" alt="Parking Info" style={{ width: "20px", marginRight: "10px" }} />
                                Ticket Information
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
                </div>
            </nav>

            <MDBContainer className="py-4">
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

                    <MDBCol lg="4">
                        <div className="row mt-5">
                            <h1 style={{ color: "black", fontSize: "30px"  }}> Personal Info </h1>
                        </div>

                        <MDBContainer className="py-5" style={{ backgroundColor: "white" }}>
                            <MDBRow>
                                <MDBCol lg="9" xl="12">
                                    <MDBCard style={{ border: "none", boxShadow: "none",backgroundColor: "#fbfbfb"}}>
                                        <div className="d-flex flex-column">
                                            <div className="rounded-top text-white ms-4 mt-4 d-flex align-items-center">
                                                <MDBCardImage src={profileImageUrl || "defaultt.png"} alt="Profile" className="mt-2 mb-2 img-thumbnail" fluid style={{ width: "150px", zIndex: "1", borderRadius: "50%" }} />
                                                {isEditing && (
                                                    <div className="ms-3">
                                                        <input type="file" onChange={(event) => setImageUpload(event.target.files[0])} style={{ marginBottom: "10px" }} />
                                                        <MDBBtn outline color="dark" style={{ height: "35px", overflow: "visible" }} onClick={uploadFile}>
                                                            Upload
                                                        </MDBBtn>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ms-4 mt-4">
                                                {isEditing ? (
                                                    <>
                                                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: "10px" }} />
                                                        <input type="text" placeholder="Location" value={address} onChange={(e) => setAddress(e.target.value)} style={{ marginBottom: "10px" }} />
                                                        <input type="text" placeholder="Email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} style={{ marginBottom: "10px" }} />
                                                        <input type="text" placeholder="Contact Number" value={companyContact} onChange={(e) => setCompanyContact(e.target.value)} style={{ marginBottom: "10px" }} />
                                                        <MDBBtn outline color="dark" style={{ height: "36px", marginTop: "20px", width: "100%" }} onClick={handleSaveProfile}>
                                                            {" "}
                                                            {/* Added width: 100% */}
                                                            Save Changes
                                                        </MDBBtn>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 text-black" style={{ fontFamily: "Georgina"}}>
                                            {!isEditing && (
                                                <MDBBtn color="dark" style={{ height: "36px", overflow: "visible", backgroundColor: "rgba(4, 55,55, 0.7) " ,border: "none" }} onClick={toggleEditing}>
                                                    Edit Profile
                                                </MDBBtn>
                                            )}
                                        </div>
                                        <MDBCardBody className="text-black p-4" style={{ fontFamily: "Georgina" }}>
                                            <div className="mb-5">
                                                {isEditing ? (
                                                    <div className="p-4"></div>
                                                ) : (
                                                    <div className="p-4" style={{ fontFamily: "Georgina", color: "black" }}>
                                                        <hr style={{ marginTop: "5px", marginBottom: "5px", borderColor: "#000000" }} />
                                                        <MDBCardText className="font-italic mb-1">
                                                            <img src="esLogo.png" alt="Establishment User Logo" style={{ width: "20px", marginRight: "10px" }} />
                                                            Username: {name}
                                                        </MDBCardText>
                                                        <MDBCardText className="font-italic mb-1">
                                                            <img src="esA.png" alt="Establishment Address Logo" style={{ width: "20px", marginRight: "10px" }} />
                                                            Address: {address}
                                                        </MDBCardText>
                                                        <MDBCardText className="font-italic mb-1">
                                                            <img src="ope.jpg" alt="Establishment User Logo" style={{ width: "20px", marginRight: "10px" }} />
                                                            Email: {companyEmail}
                                                        </MDBCardText>
                                                        <MDBCardText className="font-italic mb-1">
                                                            <img src="opcontact.png" alt="Establishment User Logo" style={{ width: "20px", marginRight: "10px" }} />
                                                            Contact: {companyContact}
                                                        </MDBCardText>
                                                    </div>
                                                )}
                                            </div>
                                        </MDBCardBody>
                                    </MDBCard>
                                </MDBCol>
                            </MDBRow>
                        </MDBContainer>
                    </MDBCol>
                    <MDBCol lg="4">
                        <div className="row mt-5">
                            <h1 style={{ color: "black", fontSize: "30px" }}> Company Parking Lot </h1>
                        </div>
                        <hr style={{ marginTop: "30px", marginBottom: "35px", border: "none" }} />

                        <MDBRow className="g-2">
                            <MDBCol className="mb-2">
                                <MDBCardImage src="https://static-ph.lamudi.com/static/media/bm9uZS9ub25l/2x2x2x380x244/7e83cd57260dee.jpg" alt="image 1" style={imageSizeStyles} className="rounded-3" />
                            </MDBCol>
                            <MDBCol className="mb-2">
                                <MDBCardImage src="https://static-ph.lamudi.com/static/media/bm9uZS9ub25l/2x2x5x880x396/54e6e09d3e6e1a.jpg" alt="image 1" style={imageSizeStyles} className="rounded-3" />
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className="g-2">
                            <MDBCol className="mb-2">
                                <MDBCardImage src="https://www.apartmentguide.com/blog/wp-content/uploads/2019/10/parking_garage_HERO.jpg" alt="image 1" style={imageSizeStyles} className="rounded-3" />
                            </MDBCol>
                            <MDBCol className="mb-2">
                                <MDBCardImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_pn4I4ZoKpjQEPxu-qmz_Db7y-jZrbNLFdAWdsG3-GUcCw-XW9SESLsm-VkkNBLy7KFI&usqp=CAU" alt="image 1" style={imageSizeStyles} className="rounded-3" />
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </section>
    );
}
