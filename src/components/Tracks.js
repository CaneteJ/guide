import React, { useState, useEffect, useContext} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Table, Button, Row, Col } from "react-bootstrap";
import {db} from "../config/firebase"
import { collection, onSnapshot, Timestamp, where, getDocs, query} from 'firebase/firestore';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBListGroup,
  MDBListGroupItem,
} from 'mdb-react-ui-kit';
import UserContext from '../UserContext';

const listItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 15px",
  transition: "background-color 0.3s ease",
  cursor: "pointer",
  backgroundColor: "#FFFFFF",
  border:"none",
  boxShadow:"none",

};
const customListItemStyle = {
  border: 'none', // Remove border from list items
  backgroundColor: "#FFFFFF",

};
const App = () => {
  const { user } = useContext(UserContext); // Initialize user first
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [managementName, setManagementName] = useState(user? user.managementName : ""); 
  const [address, setAddress] = useState(user.companyAddress || ""); 
  const [showAccountingPage, setShowAccountingPage] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [parkingLogs, setParkingLogs] = useState([]);
  const [scheduleData, setScheduleData] = useState([]); 
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleViewProfile = () => {
    navigate("/Profiles");
  };
  const handlelogin = () => {
    navigate("/")
  };
  const navigate = useNavigate();

  const listItemHoverStyle = {
    backgroundColor: "#003851",
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

  const handleShowAccountingPage = () => {
    setShowAccountingPage(true);
    setShowCustomer(false);
    setShowSchedule(false);
  };

  const handleShowCustomer = () => {
    setShowAccountingPage(false);
    setShowCustomer(true);
    setShowSchedule(false);
  };

  const handleSchedule = () => {
    setShowAccountingPage(false);
    setShowCustomer(false);
    setShowSchedule(true);
  };

  const transactions = [
    { id: 1, date: "2023-08-13", description: "Sale", amount: 500 },
    { id: 2, date: "2023-08-14", description: "Expense", amount: -100 },
  ];


  useEffect(() => {
    const fetchParkingLogs = async () => {
      if (!user || !user.managementName) {
        
        setLoading(false);
        return;
      }
      setLoading(true); 
      try {
        
        const currentUserManagementName = user.managementName;
        const logsCollectionRef = collection(db, 'logs');
        
        const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));
  
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        setParkingLogs(logs);  
      } catch (error) {
        console.error("Error fetching parking logs: ", error);
      }
      finally {
        setLoading(false); 
      }
    };

  
    
    if (user && user.managementName) {
      fetchParkingLogs();
    }
  }, [user, db]);
  
  useEffect(() => {
    const scheduleRef = collection(db, 'schedule');

    const unsubscribe = onSnapshot(scheduleRef, (snapshot) => {
      const newData = snapshot.docs.map((doc) => doc.data());
      setScheduleData(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const scheduleRef = collection(db, 'parkingLogs');

    const unsubscribe = onSnapshot(scheduleRef, (snapshot) => {
      const newData = snapshot.docs.map((doc) => doc.data());
      setRevenue(newData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

 
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
    <section style={{
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      backgroundColor: 'white', 
    }}>
      
         <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
        <div className="container">
        <Link className="navbar-brand" to="/Dashboard" style={{ fontSize: '25px'}}>
            SpotWise 
          </Link>
          <p style={styles.welcomeMessage}>
          <DropdownButton 
                alignRight
                variant="outline-light"
                title={<FaUserCircle style={styles.icon} />}
                id="dropdown-menu"
              > 
              <Dropdown.Item href="Dashboard"><img
                        src="dashboard.jpg"
                        alt="Operator Dashboard Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Dashboard</Dropdown.Item>
              <Dropdown.Item href="AgentSchedule"><img
                        src="calendar.webp"
                        alt="Agent Schedule"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Agent Schedule </Dropdown.Item> 
              <Dropdown.Item href="AgentRegistration"><img
                        src="registerA.jpg"
                        alt="Agent Register"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Register Ticket Operator</Dropdown.Item>   
                      <Dropdown.Item href="Profiles"><img
                        src="pofile.jpg"
                        alt="Management Details"
                        style={{ width: '20px', marginRight: '10px'}}
                      />View Profile</Dropdown.Item>
              <Dropdown.Item href="TicketInfo"><img
                        src="infoPark.png"
                        alt="Parking Info"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Ticket Information</Dropdown.Item> 
              <Dropdown.Item href="Feedback"><img
                        src="feedback.jpg"
                        alt="Feedback"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Feedback</Dropdown.Item>    
              <Dropdown.Divider />
                <Dropdown.Item href="/"><img
                        src="logout.png"
                        alt="Operator Logout Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Logout</Dropdown.Item>
              </DropdownButton>
          </p>
        </div>
      </nav>
      <MDBContainer className="py-5" >
  <MDBRow>
    <MDBCol lg="4">
      <MDBCard style={{ marginTop: '45px', color: '#fff'}}>
        <MDBCardBody className="text-center">
          <p style={{ fontFamily: "Georgina", fontSize: '25px', color: 'black', border:'white' , fontWeight: 'bold'}}>Administrator</p>
          {profileImageUrl ? (
            <MDBCardImage
              src={profileImageUrl}
              alt="Operator Profile Logo"
              className="rounded-circle"
              style={{ width: '70px' }}
              fluid
            />
          ) : (
            <MDBCardImage
              src="default_placeholder.jpg"
              alt="Default Profile Logo"
              className="rounded-circle"
              style={{ width: '70px' }}
              fluid
            />
          )}
          <p className="text-muted mb-1" style={{ fontFamily: 'Georgina', marginTop: '15px', color: 'black', fontWeight: 'bold'}}>
            {managementName}
          </p>
          <p className="text-muted mb-4" style={{ fontFamily: 'Georgina', fontWeight: 'bold'}}>
            {address}
          </p>
        </MDBCardBody>

            <MDBCard className="mb-4 mb-lg-0" style={{ marginTop: '40px', boxShadow: 'none', border:'none'}}>
              <MDBCardBody className="p-0">
              <MDBListGroup
      flush
      className="rounded-3"
      style={{
        border: 'none',
        borderRadius: 'none',
        boxShadow: 'none', 
      }}
    >
                  <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle}}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                     <MDBCardText onClick={() => handleAgentSchedule()} style={{fontFamily:'Georgina', fontSize:'18px', color: 'black'}}>
                    <img
                        src="calendar.webp"
                        alt="Calendar"
                        style={{ width: '25px', marginRight: '30px'}}
                      /> 
                    Agent Schedule</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle}}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                     <MDBCardText onClick={() => handleRegister()} style={{fontFamily:'Georgina', fontSize:'18px', color: 'black'}}>
                    <img
                        src="registerA.jpg"
                        alt="User"
                        style={{ width: '25px', marginRight: '30px'}}
                      /> 
                   Register Ticket Operator</MDBCardText>
                  </MDBListGroupItem>
                  
                  <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle}}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                    <MDBCardText onClick={() => handleViewProfile()} style={{fontFamily:'Georgina', fontSize:'18px', color: 'black'}}>
                        <img
                        src="pofile.jpg"
                        alt="Profile"
                        style={{ width: '25px', marginRight: '30px'}}
                      /> 
                      
                  View Profile</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle}}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                    <MDBCardText onClick={() => handleRevenues()} style={{fontFamily:'Georgina', fontSize:'18px', color: 'black'}}>
                        <img
                        src="management.jpg"
                        alt="Management"
                        style={{ width: '25px', marginRight: '30px'}}
                      /> 
                  Management Details</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={{ ...listItemStyle, ...customListItemStyle}}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                    <MDBCardText onClick={() => handleFeed()} style={{fontFamily:'Georgina', fontSize:'18px', color: 'black'}}>
                    <img
                        src="feedback.jpg"
                        alt="Feedback"
                        style={{ width: '25px', marginRight: '30px'}}
                      /> 
                    Feedback</MDBCardText>
               
                  </MDBListGroupItem>
                  <Button onClick={handlelogin} style={{fontFamily:'Georgina', width: '80px', backgroundColor:  "rgba(4, 55,55, 0.7)", marginLeft: '80px', marginTop: '75px', border: 'none'}}>Logout</Button>
                </MDBListGroup>
           
              </MDBCardBody>    
            </MDBCard>
            </MDBCard>

          </MDBCol>
          <MDBCol lg="8">
      <Container className="mt-5"style={{ backgroundColor: "white" }}>
        <h2 className="mb-4" style={{fontFamily:'Georgina', textAlign:'center', color:'black', fontWeight: 'bold'}}>Management Details Page</h2>
        <Row className="mb-4 justify-content-center">
  <Col xs={6} md={3}>
    <div className="d-flex flex-column align-items-center">
      <img src="coins.png" alt="Image Placeholder" style={{ maxWidth: "100%", maxHeight: "150px", marginBottom: '10px'}} />
      <Button onClick={handleShowAccountingPage} style={{ fontFamily: 'Georgina' ,  backgroundColor: "rgba(4, 55,55, 0.7) ", border: 'none' }}>Show Revenue</Button>
    </div>
  </Col>
  <Col xs={6} md={3}>
    <div className="d-flex flex-column align-items-center">
      <img src="customer.jpg" style={{ maxWidth: "100%", maxHeight: "150px", marginBottom: '10px' }} />
      <Button onClick={handleShowCustomer} style={{ fontFamily: 'Georgina'  , backgroundColor: "rgba(4, 55,55, 0.7) ", border: 'none' }}>Show Customer Details</Button>
    </div>
  </Col>
  <Col xs={6} md={3}>
    <div className="d-flex flex-column align-items-center">
      <img src="agent.jpg" style={{ maxWidth: "100%", maxHeight: "150px", marginBottom: '10px' }} />
      <Button onClick={handleSchedule} style={{ fontFamily: 'Georgina' ,  backgroundColor: "rgba(4, 55,55, 0.7) ", border: 'none'  }}>Show Agent Schedule</Button>
    </div>
  </Col>
</Row>
        {showAccountingPage && (
          <div>
            <h2 style={{fontFamily:'Georgina', textAlign:'center',   backgroundColor: 'white', color:'white'}}>Revenue Details</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th><img
                        src="em.png"
                        alt="Email"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Customer Email</th>
                  <th><img
                        src="calendar.webp"
                        alt="Calendar"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Date</th>
                  <th><img
                        src="desc.png"
                        alt="Description"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Description</th>
                  <th><img
                        src="amount.png"
                        alt="Amount"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Amount</th>
                </tr>
              </thead>
              <tbody>
                
              {parkingLogs.map((log) => (
                <tr key={log.id}>
                 <td>{log.email}</td>
    <td>
      <h5 style={{fontFamily:'Georgina', fontSize:'15px', color:'green'}}>
        Time in: {log.timeIn && new Date(log.timeIn.seconds * 1000).toLocaleString()}
      </h5>
      <br />
      <h5 style={{fontFamily:'Georgina', fontSize:'15px', color:'red'}}>
        Time out: {log.timeOut && new Date(log.timeOut.seconds * 1000).toLocaleString()}
      </h5>
    </td>
    <td>{log.name} - {log.paymentStatus}</td>
    <td>{user.parkingPay}</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        )}

        {showCustomer && (
          <div>
            <h2  style={{fontFamily:'Georgina', textAlign:'center', backgroundColor: 'rgba(47, 79, 79, 0.5)', color:'white'}}>Customer Details</h2>
            <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th><img
                        src="em.png"
                        alt="Email"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Customer Email</th>
                        <th><img
                        src="name.png"
                        alt="name"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Name </th>
                       <th><img
                        src="cars.jpg"
                        alt="cars"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Vehicle </th>
                       <th><img
                        src="plate.png"
                        alt="Plate number"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Vehicle Plate Number </th>
                        <th><img
                        src="timein.png"
                        alt="Time in"
                        style={{ width: '30px', marginRight: '10px'}}
                      />Time in</th>
                        <th><img
                        src="timout.png"
                        alt="Time in"
                        style={{ width: '30px', marginRight: '10px', marginLeft:'20px'}}
                      />Time out</th>
                      </tr>
                    </thead>
                    <tbody>
              { parkingLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.email}</td>
                  <td>{log.name}</td>
                  <td>{log.car}</td>
                  <td>{log.carPlateNumber}</td>
                  <td>{new Date(log.timeIn.seconds * 1000).toLocaleString()}</td>
                  <td>{new Date(log.timeOut.seconds * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
                  </Table>
          </div>
        )}
        {showSchedule && (
           <div>
             <h2 style={{fontFamily:'Georgina', textAlign:'center', backgroundColor: 'rgba(47, 79, 79, 0.5)', color:'white'}}>Agent Schedule Details</h2>
            <Table striped bordered hover>
            <thead>
              <tr>
                <th><img
                src="agent.jpg"
                alt="Agent Name"
                style={{ width: '30px', marginRight: '20px'}}
              />Agent Name</th>
                <th><img
                src="ope.jpg"
                alt="Email"
                style={{ width: '30px', marginRight: '20px'}}
              />Email Address</th>
                <th><img
                src="timein.png"
                alt="Time in"
                style={{ width: '30px', marginRight: '20px'}}
              />Time in</th>
                <th><img
                src="timout.png"
                alt="Duty Hours"
                style={{ width: '30px', marginRight: '20px'}}
              />Time out</th>
              </tr>
            </thead>
            <tbody>
            {scheduleData.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.timeIn}</td>
                  <td>{row.timeOut}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
          
        )}
        

              </Container>
              </MDBCol>

              </MDBRow>
              
              </MDBContainer>

        
      
</section>

);
};

export default App;