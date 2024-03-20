import React, { useState, useEffect, useContext } from 'react';
import { Table, Card, Container, Form, DropdownButton, Dropdown, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUserCircle } from 'react-icons/fa';
import { faCar, faCoins, faUser, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { db } from '../config/firebase';
import { collection, onSnapshot, Timestamp, where, getDocs, query} from 'firebase/firestore';
import UserContext from '../UserContext';

function TicketInfo() {

  const { user } = useContext(UserContext);

  const [parkingLogs, setParkingLogs] = useState([]);
  const [userOccupy, setOccupants] = useState(60);
  const [totalUsers, setTotalUsers] = useState(0);
  const parkingPay = user.parkingPay;
  const totalRevenues = totalUsers * parkingPay;
  const [loading, setLoading] = useState(true);


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
      marginRight: '5px',
    },
  };
  const navbar = {
    display: 'flex',
    justifyContent: 'space-between', // Align items to the right
    alignItems: 'center',
    backgroundColor: '#003851',
    marginBottom: '20px',
  };
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#333', 
    color: 'white',
    width: '100%',
  };

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
        const totalUser = logs.length;
        setTotalUsers(totalUser);
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

  function formatTimestamp(timestamp) {
    if (timestamp && timestamp.seconds && timestamp.nanoseconds) {
      const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
      return new Date(milliseconds).toLocaleString();
    } else {
      return '';
    }
  }
 

  return (
    <section style={{
      backgroundImage: 'url("parkingbackground.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      backgroundColor: '#5F9EA0', // Set a background color in case the image is not fully loaded
    }}>

<div className="dashboard-container"></div>
    <div style={{fontFamily:'Georgina', fontSize:'20px'}}>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851", marginBottom:'20px' }}>
        <div className="container">
          <Link className="navbar-brand" to="/Dashboard">
            SpotWise Parking Management System
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
              <Dropdown.Item href="Tracks"><img
                        src="management.jpg"
                        alt="Management Details"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Management Details</Dropdown.Item>
              <Dropdown.Item href="Profiles"><img
                        src="pofile.jpg"
                        alt="Management Details"
                        style={{ width: '20px', marginRight: '10px'}}
                      />View Profile</Dropdown.Item>
              <Dropdown.Item href="OperatorDashboard"><img
                        src="feedback.jpg"
                        alt="Parking Info"
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
        <div className="row mt-3">
          <div className="col-md-3">
          </div>
          <div className="col-md-3">
            <Card >
              <Card.Body>
                <Card.Title style={{ fontFamily: 'Courier New', textAlign: 'center'}}>
                  <FontAwesomeIcon icon={faCoins} color="black" /> Total Revenues
                </Card.Title>
                <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily: 'Copperplate', fontSize: '20px'}}>{totalRevenues}</Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
            <Card>
              <Card.Body>
                <Card.Title style={{ fontFamily: 'Courier New', textAlign: 'center' }}>
                  <FontAwesomeIcon icon={faUser} color="blue" /> Total Users today
                </Card.Title>
                <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily: 'Copperplate', fontSize: '20px' }}>{totalUsers}</Card.Text>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-3">
          </div>
        </div>
        <div style={{ marginLeft: '200px', marginTop: '40px', textAlign: 'center', justifyContent: 'center', width: '70%', fontFamily: 'Garamond',  backgroundColor: "rgba(16, 50, 50, 0.8)", // Background color with transparency
}}>
        {loading ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Vehicle</th>
                <th>Plate No</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {parkingLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.name}</td>
                  <td>{log.car}</td>
                  <td>{log.carPlateNumber}</td>
                  <td>{new Date(log.timeIn.seconds * 1000).toLocaleString()}</td>
                    <td>{new Date(log.timeIn.seconds * 1000).toLocaleString()}</td>
                  <td style={{ color: log.paymentStatusColor }}>{log.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          )}
        </div>
        </div>
    </section>           
    );
}

export default TicketInfo;
