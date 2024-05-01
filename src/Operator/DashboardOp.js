import React, { useState, useEffect, useContext } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import './DashboardOp.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UserContext from '../UserContext';

function DashboardOp() {
    const [pendingAccounts, setPendingAccounts] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [summaryCardsData, setSummaryCardsData] = useState([]);
    const [parkingSeeker, setParkingSeeker] = useState([]);
    const [agent, setAgent] = useState([]);
    const [activeCard, setActiveCard] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [userFound, setUserFound] = useState(true);
    const [userDetails, setUserDetails] = useState({});
    const [userPlateNumber, setUserPlateNumber] = useState("");
    const { user } = useContext(UserContext);
    const [errorMessage, setErrorMessage] = useState("");
    const [slotSets, setSlotSets] = useState([]);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [totalParkingSpaces, setTotalParkingSpaces] = useState(0);
    const [floorOptions, setFloorOptions] = useState([]);
    

    const fetchTotalParkingSpaces = async () => {
        if (user && user.managementName) {
            const establishmentsRef = collection(db, "establishments");
            const q = query(establishmentsRef, where("managementName", "==", user.managementName));
            const querySnapshot = await getDocs(q);
            let totalSpaces = 0;
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.totalSlots) {
                    totalSpaces += parseInt(data.totalSlots, 10);
                }
            });
            setTotalParkingSpaces(totalSpaces);
            console.log("Total number of Spaces", totalSpaces);
        }
    };

    useEffect(() => {
        fetchTotalParkingSpaces();
    }, [user]);  
    
    const fetchFloors = async () => {
        if (user && user.managementName) {
            const establishmentsRef = collection(db, "establishments");
            const q = query(establishmentsRef, where("managementName", "==", user.managementName));
            const querySnapshot = await getDocs(q);
            let allFloors = [];
            let totalSlots = 0;
    
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.floorDetails) {
                    data.floorDetails.forEach(floorDetail => {
                        const parkingLots = parseInt(floorDetail.parkingLots, 10);
                        if (!isNaN(parkingLots) && parkingLots > 0) {
                            allFloors.push({
                                ...floorDetail,
                                slots: new Array(parkingLots).fill({ occupied: false })
                            });
                        } else {
                            console.error('Invalid parking lots number:', floorDetail.parkingLots);
                        }
                    });
                }
            });
            
    
            console.log("Fetched Floors:", allFloors);
            setFloorOptions(allFloors);
            setTotalParkingSpaces(totalSlots);
        }
    };
    
    useEffect(() => {
        console.log("Slot Sets Updated:", slotSets);
    }, [slotSets]);

    useEffect(() => {
        const initializedSlots = floorOptions.map(floor => ({
            ...floor,
            slots: new Array(parseInt(floor.parkingLots, 10)).fill({occupied: false})
        }));
        setSlotSets(initializedSlots);
        console.log("Initialized slot sets:", initializedSlots);
    }, [floorOptions]);
    
    useEffect(() => {
        fetchFloors();
    }, [user]); // Refetch when the user object changes
    

    const handleAddToSlot = async (carPlateNumber, slotIndex) => {
        if (!carPlateNumber) {
            setErrorMessage("Please enter a plate number.");
            return;
        }
    
        if (!userFound) {
            const confirmAssign = window.confirm("No record found. Do you want to proceed?");
            if (!confirmAssign) {
                return;
            }
        }
    
        if (!slotSets.length) {
            setErrorMessage("No slot sets available.");
            return;
        }
    
        if (currentSetIndex < 0 || currentSetIndex >= slotSets.length) {
            setErrorMessage("Invalid slot set selected.");
            return;
        }
    
        const floor = slotSets[currentSetIndex];
        if (!floor || !floor.slots || slotIndex < 0 || slotIndex >= floor.slots.length) {
            setErrorMessage(`Slot index ${slotIndex} is out of bounds.`);
            return;
        }
    
        
        const floorTitle = floor.title;
        const slotId = slotIndex + 1;
        const timeIn = new Date().toISOString(); // Convert time to ISO string for Firebase
    
        const updatedSlot = {
            occupied: true,
            userDetails: {
                ...userDetails,
                email: userDetails?.email || "",
                contactNumber: userDetails?.contactNumber || "",
                carPlateNumber: userDetails?.carPlateNumber || carPlateNumber,
                slotId: slotIndex,
                agent: `${user.firstName || ''} ${user.lastName || ''}`,
                floorTitle,
                timeIn,
            }
        };
    
        floor.slots[slotIndex] = updatedSlot;
        setSlotSets([...slotSets]); // Trigger re-render
    
        const slotDocRef = doc(db, 'establishments', user.managementName, 'floors', floorTitle, 'slots', slotId.toString());
        try {
            await setDoc(slotDocRef, updatedSlot, { merge: true });
            console.log(`Slot ${slotId} assigned and updated in Firebase for floor ${floorTitle}.`);
            setErrorMessage("");
        } catch (error) {
            console.error("Failed to update slot in Firebase:", error);
            setErrorMessage("Failed to update slot in Firebase.");
        }
    };
    
    
    const searchInFirebase = async (searchInput) => {
        try {
            const collectionRef = collection(db, 'user');
            const q = query(collectionRef, where('carPlateNumber', '==', searchInput));
            const querySnapshot = await getDocs(q);
    
            const user = querySnapshot.docs.find(doc => doc.data().carPlateNumber === searchInput);
    
            if (user) {
                console.log('Found user:', user.data());
                setUserPlateNumber(user.data().carPlateNumber);
                setUserDetails(user.data());
                setUserFound(true);
            } else {
                console.log('User not found.');
                setUserDetails({});
                setUserPlateNumber(searchInput);
                setUserFound(false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const fetchParkingUsers = async () => {
            const querySnapshot = await getDocs(collection(db, "user"));
            setParkingSeeker(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchParkingUsers();
        const fetchAgents = async () => {
            const querySnapshot = await getDocs(collection(db, "agents"));
            setAgent(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchAgents();
        const fetchEstablishments = async () => {
            const querySnapshot = await getDocs(collection(db, "establishments"));
            setEstablishments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchEstablishments();
        const fetchPendingAccounts = async () => {
            const querySnapshot = await getDocs(query(collection(db, "pendingEstablishments")));
            setPendingAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPendingAccounts();
    }, []);

    useEffect(() => {
        setSummaryCardsData([
            { title: 'Total Parking Spaces', value: `${totalParkingSpaces}`, imgSrc: 'pending.png', cardType: 'total' },
            { title: 'Occupied Spaces', value: `${pendingAccounts.length} Account Pending`, imgSrc: 'pending.png', cardType: 'occupied' },
            { title: 'Available Spaces', value: `${establishments.length} Registered`, imgSrc: 'check.png', cardType: 'available' },
            { title: 'Reserve Spaces', value: `${parkingSeeker.length} Registered`, imgSrc: 'check.png', cardType: 'reserve' },
            { title: 'Add Vehicle', imgSrc: 'check.png', cardType: 'agents' }
        ]);
    }, [pendingAccounts, establishments, parkingSeeker, agent]);

    const handleCardClick = (cardType) => {
        console.log(`Card clicked: ${cardType}`);
        setActiveCard(activeCard === cardType ? '' : cardType);
    };
    

    const renderFormBasedOnCardType = () => {
        let data ;
        let headers = [];
        switch (activeCard) {
            case 'occupied':
                data = pendingAccounts;
                headers = ["Email", "Contact Number", "Plate Number", "Slot Number"];
                break;
            case 'available':
                data = establishments;
                headers = ["Location", "Slot Number"];
                break;
            case 'reserve':
                data = parkingSeeker;
                headers = ["Email", "Plate Number", "Location", "Slot Number", "Date"];
                break;
            case 'agents':
                return <AddVehicleForm onSearch={searchInFirebase} floorOptions={floorOptions} handleAddToSlot={handleAddToSlot} />;
            default:
                return null;
        }
    //////
    //////
    /////
    
        return (
            <section className="intro">
                <div className="bg-image h-100" style={{ backgroundColor: '#6095F0' }}>
                    <div className="mask d-flex align-items-center h-100">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-12">
                                    <div className="card shadow-2-strong" style={{ backgroundColor: '#f5f7fa' }}>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-borderless mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                                                </div>
                                                            </th>
                                                            {headers.map((header, index) => (
                                                                <th scope="col" key={index}>{header.toUpperCase()}</th>
                                                            ))}
                                                            <th scope="col">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.map((item, index) => (
                                                            <tr key={index}>
                                                                <th scope="row">
                                                                    <div className="form-check">
                                                                        <input className="form-check-input" type="checkbox" value="" id={`flexCheckDefault${index}`} checked={item.checked} />
                                                                    </div>
                                                                </th>
                                                                {headers.map((header, subIndex) => (
                                                                    <td key={`${index}-${subIndex}`}>{item[header.toLowerCase().replace(/ /g, '')]}</td>
                                                                ))}
                                                                <td>
                                                                    <button type="button" className="btn btn-danger btn-sm px-3" onClick={() => handleDecline(item.id)}>
                                                                        <i className="fas fa-times">X</i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    
    const handleApprove = async (accountId) => {
        const accountRef = doc(db, "pendingEstablishments", accountId);
        const accountSnapshot = await getDoc(accountRef);
        const accountData = accountSnapshot.data();
      
    
        await setDoc(doc(db, "establishments", accountId), {
          ...accountData,
          createdAt: new Date(),
          isApproved: true
        });
      
        await deleteDoc(accountRef);
      
        setPendingAccounts(pendingAccounts.filter(account => account.id !== accountId));
      };

      const handleDecline = async (accountId) => {
      }
      
       
    return (
        <div>
        <div className="admin-dashboard">
      <div className="sidebar">
      <div className="admin-container">
    <img 
      src="customer.jpg"
      alt="Admin"
      className="admin-pic" 
      style={{ width: '50px', marginRight: '10px' }} 
    />
    <span className="admin-text">Admin</span>
  </div>
  <p><a href ='FetchEstablishments' style={{ color: 'white', textDecoration: 'none' }}> Establishment List</a></p>
  <p><a href ='FetchParkingUsers' style={{ color: 'white', textDecoration: 'none' }}> Parking Seeker List</a></p>

  <p><a href ='FetchAgents' style={{ color: 'white', textDecoration: 'none' }}> Agents List</a></p>
       
      </div>
      <div className="main-content">
                <div className="summary-cards">
                    {summaryCardsData.map(card => (
                        <div key={card.title} className={`card card-${card.cardType}`} onClick={() => handleCardClick(card.cardType)}>
                            <img src={card.imgSrc} alt={card.title} className="card-image" />
                            <div className="card-content">
                                <div className="card-title">{card.title}</div>
                                <div className="card-value">{card.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
                {renderFormBasedOnCardType()}
      </div>
    </div>       
    </div>
    );
}

function AddVehicleForm({ onSearch, floorOptions, handleAddToSlot }) {
    const [plateNumber, setPlateNumber] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [slotOptions, setSlotOptions] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');

    useEffect(() => {
        console.log("Floor options updated:", floorOptions);
        if (floorOptions.length > 0) {
            setSelectedFloor(floorOptions[0].floorName); // Set default selected floor
        }
    }, [floorOptions]);

    useEffect(() => {
        if (selectedFloor) {
            const floor = floorOptions.find(f => f.floorName === selectedFloor);
            if (floor && !isNaN(parseInt(floor.parkingLots, 10))) {
                const slots = Array.from({ length: parseInt(floor.parkingLots, 10) }, (_, i) => i + 1);
                setSlotOptions(slots);
            } else {
                console.log("Invalid or missing data for floor:", selectedFloor);
                setSlotOptions([]);
            }
        }
    }, [selectedFloor, floorOptions]);

    const handleSearch = () => {
        if (plateNumber) {
            onSearch(plateNumber);
        } else {
            alert("Please enter a plate number to search.");
        }
    };

    const handleFloorChange = (e) => {
        setSelectedFloor(e.target.value);
    };

    const handleSlotSelection = (e) => {
        setSelectedSlot(e.target.value);
    };

    const handleSubmit = () => {
        if (!plateNumber) {
            alert("Please enter a plate number to search.");
            return;
        }
        let slotIndex = parseInt(selectedSlot) - 1; // Convert to zero-based index
        if (slotIndex < 0 || slotIndex >= slotOptions.length) {
            alert("Please select a valid slot.");
            return;
        }
        handleAddToSlot(plateNumber, slotIndex);
    };

    return (
        <Form>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridEmail">
                    <Form.Control type="email" placeholder="Enter email" />
                </Form.Group>
                <Form.Group as={Col} controlId="formGridPlateNumber">
                    <Form.Control
                        type="text"
                        placeholder="Plate Number"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                    />
                </Form.Group>
            </Row>
            <Form.Group className="mb-3" controlId="formGridContactNumber">
                <Form.Control placeholder="Contact Number" />
            </Form.Group>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridTimeIn">
                    <Form.Control placeholder="Time In" />
                </Form.Group>
                <Form.Group as={Col} controlId="formGridFloor">
                <Form.Select defaultValue="Choose..." onChange={handleFloorChange}>
    <option>Choose...</option>
    {floorOptions.map((floor, index) => (
        <option key={index} value={floor.floorName}>{floor.floorName}</option>
    ))}
</Form.Select>
</Form.Group>
<Form.Group as={Col} controlId="formGridSlotNumber">
    <Form.Select defaultValue="Select Slot" onChange={handleSlotSelection}>
        <option value="">Select Slot...</option>
        {slotOptions.map((slot, index) => (
            <option key={index} value={slot}>{slot}</option>
        ))}
    </Form.Select>
</Form.Group>
            </Row>
            <Button variant="primary" onClick={handleSubmit}>Assign Slot</Button>
            <Button variant="secondary" onClick={handleSearch}>Search</Button>
        </Form>
    );
}



export default DashboardOp;