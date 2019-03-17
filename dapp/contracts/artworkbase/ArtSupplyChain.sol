pragma solidity ^0.5.0;

// Import the roles and ownable contracts
import "../artworkaccesscontrol/ArtistRole.sol";
import "../artworkaccesscontrol/ArtAdopterRole.sol";
import "../artworkaccesscontrol/ShipperRole.sol";
import "../artworkcore/Ownable.sol";

// Define a contract 'ArtSupplychain'
contract ArtSupplyChain is ArtistRole, ShipperRole, ArtAdopterRole, Ownable {

    // Define a variable for the next available ID for an Artwork
    uint  seq;

    // Define a public mapping 'artworks' that maps the artwork ID to an Artwork.
    mapping (uint => Artwork) artworks;

    // Define a private mapping to keep track of created artwork IDs
    mapping (uint => bool) private artworkIds;

    // Define a public mapping 'artworksHistory' that maps the unique artwork ID to an array of TxHash, 
    // that track its journey through the supply chain -- to be sent from DApp.
    mapping (uint => string[]) artworksHistory;
  
    // Define enum 'State' with the following values:
    enum State 
    { 
        Created,    // 0
        Framed,     // 1
        Adoptable,  // 2
        Adopted,    // 3
        Packed,     // 4
        PickedUp,   // 5
        Shipped,    // 6
        Delivered   // 7
    }

    State constant defaultState = State.Created;

    // Define a struct 'Artwork' with the following fields:
    struct Artwork {
        uint    artworkID; // Unique artwork ID, goes on the package, can be verified by the Adopter
        string  artworkTitle; // Title of the artwork
        uint    artworkYear; // Year the artwork was created
        string  artworkMedium; // The support and materials used to create the artwork
        string  artworkStyle; // The style of the artwork (e.g. abstract expressionism)
        address artworkOwnerID;  // Metamask-Ethereum address of the current owner as the product moves through 8 stages (or states)
        address payable originArtistID; // Metamask-Ethereum address of the Artist
        string  originArtistName; // Artist Name
        string  originArtistInfo;  // Artist Information
        string  originArtistLocation; // Location of Artist
        string  artistNotes; // Artist's Artwork Notes
        uint256 artworkPrice; // Artwork Price
        State   artworkState;  // Artwork State as represented in the enum above
        address payable artAdopterID; // Metamask-Ethereum address of the Art Adopter
        address shipperID;  // Metamask-Ethereum address of the Shipper
    }

    // Define the artwork events to be emitted during the 7 stages of the supply chain
    event Created(uint artworkID);
    event Framed(uint artworkID);
    event Adoptable(uint artworkID);
    event Adopted(uint artworkID);
    event Packed(uint artworkID);
    event PickedUp(uint artworkID);
    event Shipped(uint artworkID);
    event Delivered(uint artworkID);

    // Define a modifier that checks the owner of the artwork
    modifier onlyArtworkOwner (uint _artworkID) {
        address _artworkOwner = artworks[_artworkID].artworkOwnerID;
        require(msg.sender == _artworkOwner, "Only Artwork owner is allowed");
        _;
    }

    // Define a modifer that verifies the Caller
    modifier verifyCaller (address _address) {
        require(msg.sender == _address, "Address is not equal to the sender"); 
        _;
    }

    // Define a modifer that verifies the caller has the Artist role and
    // that the msg.sender is the original creator of the artwork
    modifier verifyArtist (uint _artworkID) {
        address _originArtistID = artworks[_artworkID].originArtistID;
        require(msg.sender == _originArtistID, "Sender is not the Origin Artist"); 
        _;
    }

    // Define a modifer that verifies the caller has the Shipper role and 
    // that the msg.sender is the assigned Shipper for the artwork.
    modifier verifyShipper (uint _artworkID) {
        address _shipperID = artworks[_artworkID].shipperID;
        require(msg.sender == _shipperID, "Sender is not the Shipper"); 
        _;
    }

    // Define a modifer that verifies the caller has the ArtAdopter role and 
    // that the msg.sender is the actual adopter of the artwork.
    modifier verifyAdopter (uint _artworkID) {
        address _adopterID = artworks[_artworkID].artAdopterID;
        require(msg.sender == _adopterID, "Sender is not the Art Adopter"); 
        _;
    }

    // Define a modifier that checks if the paid amount is sufficient to cover the price
    modifier sufficientFunds(uint _artworkID) { 
        uint256 _price = artworks[_artworkID].artworkPrice;
        require(msg.value >= _price, "Insufficient funds"); 
        _;
    }
  
    // Define a modifier that checks the price and refunds the remaining balance
    modifier handleExcess(uint _artworkID) {
        _;
        uint256 _price = artworks[_artworkID].artworkPrice;
        uint256 amountToReturn = msg.value - _price;

        if (amountToReturn > 0) {
            msg.sender.transfer(amountToReturn);
        }
    }

    // This will ensure the artworkID exists on the blockchain
    modifier has(uint _artworkID) {
        require(_artworkID > 0);
        require(artworkIds[_artworkID], "Artwork doesn't exist");
        _;
    }

    // Define a modifier that checks if a state of an artwork is Created
    modifier created(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Created, "Artwork not created");
        _;
    }

    // Define a modifier that checks if a state of an artwork is Framed
    modifier framed(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Framed, "Artwork not framed");
        _;
    }
  
    // Define a modifier that checks if a state of an artwork is Adoptable
    modifier adoptable(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Adoptable, "Artwork not adoptable");
        _;
    }

    // Define a modifier that checks if a state of an artwork is Adopted
    modifier adopted(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Adopted, "Artwork not adopted");
        _;
    }
  
    // Define a modifier that checks if a state of an artwork is Packed
    modifier packed(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Packed, "Artwork not packed");
        _;
    }

    // Define a modifier that checks if a state of an artwork is Picked Up by the shipper
    modifier pickedUp(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.PickedUp, "Artwork not picked up");
        _;
    }

    // Define a modifier that checks if a state of an artwork is Shipped
    modifier shipped(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Shipped, "Artwork not shipped");
        _;
    }

    // Define a modifier that checks if a state of an artwork is Delivered
    modifier delivered(uint _artworkID) {
        require(artworks[_artworkID].artworkState == State.Delivered, "Artwork not delivered");
        _;
    }

    // In the Ownable constructor the 'owner' is set to the address that instantiated the contract
    // and set 'artworkID' to 1
    constructor() public payable {
        seq = 1;
    }

    // Define a function 'createArtwork' that allows an artist to mark an artwork 'Created'
    // Only the artist can create the artwork, and must be the same as the creator of the art
    function createArtwork
    (
        string memory artworkTitle,
        uint artworkYear,
        string memory artworkMedium,
        string memory artworkStyle,
        address payable originArtistID, 
        string memory originArtistName, 
        string memory originArtistInfo, 
        string memory originArtistLocation,  
        string memory artistNotes
    ) 
        public
        verifyCaller(originArtistID)
        returns
        (
            uint artworkID
        )
    {
        artworkID = seq++;

        artworks[artworkID] = Artwork
        (
            artworkID,
            artworkTitle,
            artworkYear,
            artworkMedium,
            artworkStyle,
            originArtistID,
            originArtistID,
            originArtistName,
            originArtistInfo,
            originArtistLocation,
            artistNotes,
            uint256(0),
            State.Created,
            address(0),
            address(0)
        );

        // Add ID to mapping of created artworks
        artworkIds[artworkID] = true;

        // Emit the appropriate event
        emit Created(artworkID);

        // Add the new artist, if not already done
        if (!isArtist(originArtistID)) {
            addArtist(originArtistID);
        }
    }

    // Define a function 'frameArtwork' that allows an artist to mark an artwork 'Framed'
    function frameArtwork(uint _artworkID) 
        public
        onlyArtist
        onlyArtworkOwner(_artworkID)
        created(_artworkID)
        verifyArtist(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        a.artworkState = State.Framed;

        emit Framed(_artworkID);
    }

    // Define a function 'adoptableArtwork' that allows an artist to mark an artwork as 'ForAdoption'
    function adoptableArtwork(uint _artworkID, uint256 _price) 
        public 
        onlyArtist
        onlyArtworkOwner(_artworkID)
        framed(_artworkID)
        verifyArtist(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        a.artworkState = State.Adoptable;
        a.artworkPrice = _price;

        emit Adoptable(_artworkID);
    }

    // Define a function 'adoptArtwork' that allows the adopter to mark an item 'Adopted'
    // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough, 
    // and any excess ether sent is refunded back to the buyer
    function adoptArtwork(uint _artworkID, address payable _adopterID) 
        public 
        payable 
        //onlyArtAdopter - TODO: user is able to register as an art adopter
        adoptable(_artworkID)
        verifyCaller(_adopterID)
        sufficientFunds(_artworkID)
        handleExcess(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        uint256 price = a.artworkPrice;
        // Transfer money to artist and emit 'Adopted' event
        a.originArtistID.transfer(price);

        a.artAdopterID = _adopterID;
        a.artworkOwnerID = _adopterID;
        a.artworkState = State.Adopted;

        emit Adopted(_artworkID);
    }

    // Define a function 'packArtwork' that allows an artist to mark an artwork 'Packed'
    function packArtwork(uint _artworkID) 
        public 
        onlyArtist
        adopted(_artworkID)
        verifyArtist(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        // Maker artist the artwork owner again, while it's being packed
        a.artworkOwnerID = msg.sender;
        a.artworkState = State.Packed;

        emit Packed(_artworkID);
    }

    // Define a function 'pickUpArtwork' that allows a shipper to mark an artwork 'PickedUp'
    function pickUpArtwork(uint _artworkID) 
        public 
        packed(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        // Update the artwork owner and assign shipper ID
        // Ownership is tracked at each stage of the process
        a.artworkOwnerID = msg.sender;
        a.shipperID = msg.sender;

        // Update state and emit 'PickedUp'
        a.artworkState = State.PickedUp;

        emit PickedUp(_artworkID);

        // Add rep picking up the artwork to the Shipper accounts
        if (!isShipper(msg.sender)) {
            addShipper(msg.sender);
        }
    }

    // Define a function 'shipArtwork' that allows the shipper to mark an artwork 'Shipped'
    function shipArtwork(uint _artworkID) 
        public
        onlyShipper
        onlyArtworkOwner(_artworkID)
        pickedUp(_artworkID)
        verifyShipper(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        // Update with state and emit Shipped
        a.artworkState = State.Shipped;
    
        emit Shipped(_artworkID);
    }

    // Define a function 'deliverArtwork' that allows the shipper to mark an artwork 'Delivered'
    // Use the above modifiers to check if the item is shipped
    function deliverArtwork(uint _artworkID) 
        public
        onlyShipper
        onlyArtworkOwner(_artworkID)
        shipped(_artworkID)
        verifyShipper(_artworkID)
    {
        Artwork storage a = artworks[_artworkID];

        // Update owner to art adopter and emit event
        a.artworkOwnerID = a.artAdopterID;
        a.artworkState = State.Delivered;
    
        emit Delivered(_artworkID);
    }

    // Define a function 'fetchArtworkOwner' that gets the current owner of the artwork
    function fetchArtworkOwner(uint _artworkID)
        public
        view
        has(_artworkID)
        returns (address artworkOwnerID)
    {
        artworkOwnerID = artworks[_artworkID].artworkOwnerID;
    }

    // Define a function 'fetchArtworkOwnerAndState' that gets the current owner and state of the artwork
    function fetchArtworkOwnerAndState(uint _artworkID)
        public 
        view
        has(_artworkID)
        returns
        (
            address artworkOwnerID,
            State artworkState
        )
    {
        artworkOwnerID = artworks[_artworkID].artworkOwnerID;
        artworkState = artworks[_artworkID].artworkState;
    }

    // Define a function 'fetchArtworkState' that gets the current state of the artwork
    function fetchArtworkState(uint _artworkID)
        public 
        view
        has(_artworkID)
        returns (State artworkState)
    {
        artworkState = artworks[_artworkID].artworkState;
    }

    // Define a function 'fetchArtworkPrice' that gets the adoption price of the artwork
    function fetchArtworkPrice(uint _artworkID)
        public 
        view
        has(_artworkID)
        returns (uint256 artworkPrice)
    {
        artworkPrice = artworks[_artworkID].artworkPrice;
    }

    // Define a functon 'fetchArtistDetails' that gets the artist information
    function fetchArtistDetails(uint _artworkID) 
        public 
        view
        has(_artworkID)
        returns
        (
            address payable originArtistID,
            string memory originArtistName,
            string memory originArtistInfo,
            string memory originArtistLocation
        )
    {
        Artwork storage a = artworks[_artworkID];

        return
        (
            a.originArtistID,
            a.originArtistName,
            a.originArtistInfo,
            a.originArtistLocation
        );
    }


    // Define a function 'fetchArtworkDetails' that fetches the artwork data
    function fetchArtworkDetails(uint _artworkID) 
        public 
        view 
        has(_artworkID)
        returns (
            uint artworkID,
            address artworkOwnerID,
            string memory artworkTitle,
            uint artworkYear,
            string memory artworkMedium,
            string memory artworkStyle,
            uint256 artworkPrice,
            string memory artistNotes,
            State artworkState,
            address payable artAdopterID,
            address shipperID
        ) 
    {
        Artwork storage a = artworks[_artworkID];
    
        return 
        (
            a.artworkID,
            a.artworkOwnerID,
            a.artworkTitle,
            a.artworkYear,
            a.artworkMedium,
            a.artworkStyle,           
            a.artworkPrice,
            a.artistNotes,
            a.artworkState,
            a.artAdopterID,
            a.shipperID
        );
    }
}
