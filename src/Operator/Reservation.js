import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../config/firebase";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";
import UserContext from "../UserContext";
import OperatorReserve from "./operatorReserve";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Reservation = () => {

    const { user } = useContext(UserContext);
    const [reservationRequests, setReservationRequests] = useState([]);
    const [historyLog, setHistoryLog] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [userNames, setUserNames] = useState({});
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [slotSets, setSlotSets] = useState([]);

    const fetchReservations = async (managementName) => {
        console.log("Fetching reservations for managementName:", managementName);
        const q = query(collection(db, "reservations"), where("managementName", "==", managementName));
        try {
            const querySnapshot = await getDocs(q);
            const reservationPromises = querySnapshot.docs.map(async (reservationDoc) => {
                const slotId = reservationDoc.data().slotId;
                const userEmail = reservationDoc.data().userEmail;

                // Fetch the floor name from the slotData sub-document
                const slotDocRef = doc(db, "slot", managementName, "slotData", `slot_${slotId}`);
                const slotDocSnapshot = await getDoc(slotDocRef);

                // Fetch user data
                const userQuery = query(collection(db, "user"), where("email", "==", userEmail));
                const userSnapshot = await getDocs(userQuery);
                const userData = userSnapshot.docs[0]?.data();

                setUserNames((prevUserNames) => ({
                    ...prevUserNames,
                    [userEmail]: userData?.name || "N/A",
                }));

                return {
                    id: reservationDoc.id,
                    name: reservationDoc.data().name,
                    userName: userData?.name || "N/A", // Add the userName property
                    plateNumber: userData?.carPlateNumber || "N/A",
                    slot: typeof slotId === "string" ? slotId.slice(1) : "N/A",
                    slotId: slotId,
                    timeOfRequest: new Date(reservationDoc.data().timestamp.seconds * 1000).toLocaleTimeString("en-US", { hour12: true, hour: "numeric", minute: "numeric" }),
                };
            });
            const reservations = await Promise.all(reservationPromises);
            console.log("Fetched reservations:", reservations);
            setReservationRequests(reservations);
        } catch (error) {
            console.error("Error fetching reservations:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && user?.managementName) {
                console.log("User authenticated. Fetching reservations...");
                fetchReservations(user.managementName);
            } else {
                console.log("User not authenticated or managementName is null.");
                setReservationRequests([]);
            }
        });

        return () => unsubscribe();
    }, [user?.managementName]);

    useEffect(() => {
        localStorage.setItem("reservationRequests", JSON.stringify(reservationRequests));
    }, [reservationRequests]);

    useEffect(() => {
        const storedHistoryLog = JSON.parse(localStorage.getItem("historyLog"));
        if (storedHistoryLog) {
            setHistoryLog(storedHistoryLog);
        }
    }, []);

    const getContinuousSlotNumber = (currentSetIndex, index) => {
        let previousSlots = 0;
        for (let i = 0; i < currentSetIndex; i++) {
            previousSlots += slotSets[i].slots.length;
        }
        return previousSlots + index + 1;
    };

    const handleReservation = async (accepted, reservationRequest, index) => {
        const { id, userName, plateNumber, slotId, timeOfRequest } = reservationRequest;
        const status = accepted ? "Accepted" : "Declined";

        // Create a log entry for the history
        const logEntry = {
            status,
            name: userName,
            plateNumber,
            slotId,
            timeOfRequest,
        };

        // Update the history log in state and local storage
        setHistoryLog([logEntry, ...historyLog]);
        localStorage.setItem("historyLog", JSON.stringify([logEntry, ...historyLog]));

        if (accepted) {
            const previousSlot = getContinuousSlotNumber(currentSetIndex, index);
            const uniqueSlotId = `${index}`;
            const userDetails = {
                name: userName,
                plateNumber,
                slotId,
            };

            const slotDocRef = doc(db, "res", user.managementName, "resData", `slot_${slotId}`);

            try {
                // Set user details in slotData and mark the slot as occupied
                await setDoc(
                    slotDocRef,
                    {
                        userDetails,
                        slotId,
                        status: "Occupied",
                        timestamp: new Date(),
                    },
                    { merge: true }
                );

                // Remove the reservation from the 'reservations' collection
                const reservationDocRef = doc(db, "reservations", id);
                await deleteDoc(reservationDocRef);

                console.log(`Reservation accepted for slot ${slotId} and moved to slotData.`);
                alert(`Reservation accepted for ${userName} at slot ${slotId}`);
            } catch (error) {
                console.error("Error accepting reservation and updating slotData:", error);
                alert("Failed to accept the reservation. Please try again.");
            }
        } else {
            // Code for declining the reservation
            try {
                // Update the reservation status to 'Declined' in Firebase
                const reservationDocRef = doc(db, "reservations", id);
                await setDoc(reservationDocRef, { status: "Declined" }, { merge: true });

                console.log(`Reservation declined for ${userName}.`);
                alert(`Reservation declined for ${userName}.`);
            } catch (error) {
                console.error("Error updating reservation status:", error);
                alert("Failed to update the reservation status. Please try again.");
            }
        }

        // Remove the reservation from the list in state (for both accept and decline)
        const updatedRequests = reservationRequests.filter((_, i) => i !== index);
        setReservationRequests(updatedRequests);

        // Update local storage only for accepted reservations
        if (accepted) {
            localStorage.setItem("reservationRequests", JSON.stringify(updatedRequests));
        }

        // Update the selected reservation state if needed
        setSelectedReservation({
            status,
            name: userName,
            plateNumber,
            slotId,
            timeOfRequest,
        });
    };

    const [showNotification, setShowNotification] = useState(false);

    const HistoryLog = ({ historyLog }) => {
        const [showAccepted, setShowAccepted] = useState(false);
        const [showDeclined, setShowDeclined] = useState(false);
    
        const handleClearHistory = () => {
            localStorage.removeItem("historyLog");
        };
    
        return (
            <div style={{ border: "3px solid #ccc", borderRadius: "8px", padding: "10px", position: "relative", borderColor: '#7abdea' }}>
                <h5 style={{ color: "#003851", textAlign: "left", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Reservation History</h5>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        className="btn btn-primary"
                        style={{ margin: "5px", width: "150px" }}
                        onClick={() => setShowAccepted(!showAccepted)}
                    >
                        {showAccepted ? "Hide Accepted" : "Show Accepted"}
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ margin: "5px", width: "150px" }}
                        onClick={() => setShowDeclined(!showDeclined)}
                    >
                        {showDeclined ? "Hide Declined" : "Show Declined"}
                    </button>
                    <button
                        className="btn btn-danger"
                        style={{ margin: "5px", width: "150px" }}
                        onClick={handleClearHistory}
                    >
                        Clear History
                    </button>
                </div>
                {showAccepted && (
                    <div>
                        <h6 className="mt-3">Accepted Reservations</h6>
                        {historyLog.map((logEntry, index) => logEntry.status === "Accepted" && (
                            <div className="alert alert-success mt-2" key={index}>
                                <strong>Accepted:</strong> {logEntry.name} requested a reservation on {logEntry.slotId}. Plate Number: {logEntry.plateNumber}, Slot: {logEntry.slotId}
                            </div>
                        ))}
                    </div>
                )}
                {showDeclined && (
                    <div>
                        <h6 className="mt-3">Declined Reservations</h6>
                        {historyLog.map((logEntry, index) => logEntry.status === "Declined" && (
                            <div className="alert alert-danger mt-2" key={index}>
                                <strong>Declined:</strong> {logEntry.name} requested a reservation on {logEntry.slotId}. Plate Number: {logEntry.plateNumber}, Slot: {logEntry.slotId}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    
    const ReservationRequest = ({ request, index }) => {
        const [showMapModal, setShowMapModal] = useState(false);
      
        const toggleMapModal = () => {
          setShowMapModal(!showMapModal);
        };
      
        return (
          <div className="reservation-request mb-4 border p-3 rounded bg-light" style={{ maxWidth: '800px' }} key={request.plateNumber}>
            {/* Headers */}
            <div className="d-flex justify-content-between mb-2 text-muted">
              <div className="p-2"><strong>Name</strong></div>
              <div className="p-2"><strong>Time of Request</strong></div>
              <div className="p-2"><strong>Plate Number</strong></div>
              <div className="p-2"><strong>Slot Number</strong></div>
            </div>
      
            {/* Details */}
            <div className="d-flex justify-content-between mb-2">
              <div className="p-2">{request.userName}</div>
              <div className="p-2">{request.timeOfRequest}</div>
              <div className="p-2">{request.plateNumber}</div>
              <div className="p-2">{request.slotId}</div>
            </div>
      
            {/* MA CLICK NGA ICON SA MAP */}
            <Button variant="primary" onClick={toggleMapModal}>
              <i className="bi bi-geo-alt"></i> View Map
            </Button>
      
            {/* PARA SA MAP*/}
            <Modal show={showMapModal} onHide={toggleMapModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Map</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${request.latitude},${request.longitude}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7Clabel:S%7C${request.latitude},${request.longitude}&key=YOUR_API_KEY`}
                  alt="Map"
                  style={{ width: '100%', height: 'auto' }}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={toggleMapModal}>Close</Button>
              </Modal.Footer>
            </Modal>
      
            {/* Buttons */}
            <div className="d-flex flex-row align-items-center mt-2">
              <button className="btn btn-success mr-2" onClick={() => handleReservation(true, request, index)}>
                Accept Reservation
              </button>
              <button className="btn btn-danger" onClick={() => handleReservation(false, request, index)}>
                Decline Reservation
              </button>
            </div>
          </div>
        );
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
            <div>
                
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#132B4B" }}>
    <div className="container d-flex justify-content-between">
        <a className="navbar-brand" style={{padding: 35}}>
            {/* Your logo or brand name here */}
        </a>
        <div>
            <button className="btn" onClick={() => setShowNotification(!showNotification)} style={{ color: 'white', border: 'none', background: 'none' }}>
                <FontAwesomeIcon icon={faBell} size="lg" />
                {/* Optionally display a badge with notification count */}
                {showNotification && <span className="badge rounded-pill bg-danger">3</span>}
            </button>
        </div>
    </div>
</nav>

                <MDBContainer className="py-4">
                    <MDBRow>
                        <MDBCol lg="4">
                            <OperatorReserve />
                        </MDBCol>
                        <MDBCol lg="4">
                <div className="container mt-5 d-flex flex-column align-items-center justify-content-center" >
                <h3 style={{ color: "#003851", textAlign: "center", fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem", marginLeft: '-100%' }}>
                        Parking Reservation Management
                    </h3>
                    
                    <div style={{ width: "90vh", height: "60vh", overflowY: "scroll", padding: "10px", background: "#132B4B", marginLeft: '-100%'}}>
                        {reservationRequests.length === 0 ? (
                            <p>No reservation</p>
                        ) : (
                            reservationRequests.map((request, index) => (
                                <ReservationRequest
                                    request={request}
                                    index={index}
                                    key={index}
                                    slotIndex={request.slotId} // Pass the slotId as slotIndex
                                />
                            ))
                        )}
                        
                    </div>
                </div>

                </MDBCol>
                <MDBCol lg="4">
                    <nav style={{ backgroundColor: "white", marginRight: '-50%', marginLeft: 'auto', borderWidth: 1, borderColor: "#003851", marginTop: '26%'}}>
                    <HistoryLog historyLog={historyLog} />
                    </nav>
                    </MDBCol>
                    </MDBRow>

                </MDBContainer>
            </div>
        </section>
    );
};

export default Reservation;