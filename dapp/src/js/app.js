/*
 * Art Shop dApp - Udacity project
 *  Allows artists to put their work up for adoption and tracks the stages and authenticity
 *  using the blockchain.
 */

App = {
    web3Provider: null,
    contract: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    artworkID: 0,
    metaMaskAccountID: "0x0000000000000000000000000000000000000000",
    artworkOwnerID: "0x0000000000000000000000000000000000000000",
    originArtistID: "0x0000000000000000000000000000000000000000",
    originArtistName: null,
    originArtistInfo: null,
    originArtistLocation: null,
    artworkTitle: null,
    artworkYear: 0,
    artworkMedium: null,
    artworkStyle: null,
    artistNotes: null,
    artworkPrice: 0,
    artworkState: -1,
    artAdopterID: "0x0000000000000000000000000000000000000000",
    shipperID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        /// Setup access to blockchain
        return await App.initWeb3()
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum
            try {
                // Request account access
                await window.ethereum.enable()
            } catch (error) {
                // User denied account access...
                App.setError("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
        }

        // Get the current, active Meta Mask account and set the initial Artist ID on the form data
        App.getMetaMaskAccount()

        // Initialize the ArtSupplyChain contract
        return App.initArtSupplyChain()
    },

    initArtSupplyChain: function () {
        const json = '../build/contracts/ArtSupplyChain.json'

        $.getJSON(json, function(data) {
            const ArtSupplyChainArtifact = data;
            App.contract.ArtSupplyChain = TruffleContract(ArtSupplyChainArtifact);
            App.contract.ArtSupplyChain.setProvider(App.web3Provider);

            App.initArtworkSpec()
            App.subscribeToEvents()
        })

        return App.bindEvents()
    },

    setMetaMaskAccount: function(ID) {
        App.metaMaskAccountID = ID
        $("#metaMaskAccountID").html(ID)
    },

    getMetaMaskAccount: function (event) {
        web3 = new Web3(App.web3Provider);

        // Get the currently active MetaMask account
        web3.eth.getAccounts(function(err, accounts) {
            if (err) {
                console.log('Error:', err);
                return;
            }
            App.setMetaMaskAccount(accounts[0])

            if (event) {
                // Update the form data if applicable
                if (event.target.className === 'input-address' && 
                            $(event.target).val() === '' &&
                            event.target.id !== 'artworkOwnerID')
                    $(event.target).val(accounts[0])
            }
        })
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick)
        $(".input-address").on('click', App.handleAddressClick)
    },

    handleAddressClick: function(event) {
        event.preventDefault() 
        App.getMetaMaskAccount(event)
    },

    handleButtonClick: function(event) {
        event.preventDefault()

        var requestID = App.getRequestID()
        App.getMetaMaskAccount(event)

        switch (requestID) {
            case 0:
                App.createArtwork(event)
                break
            case 1:
                App.frameArtwork(event)
                break
            case 2:
                App.adoptableArtwork(event)
                break
            case 3:
                App.adoptArtwork(event)
                break
            case 4:
                App.packArtwork(event)
                break
            case 5:
                App.pickUpArtwork(event)
                break
            case 6:
                App.shipArtwork(event)
                break
            case 7:
                App.deliverArtwork(event)
                break
            case 8:
                App.fetchArtworkItem(event)
                break
            }
    },

    createArtwork: async function(event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form data to create the Artwork
            // Also sets the App's origin Artist ID from the current MetaMask account
            App.getNewArtworkSpec()

            let result = await artSupplyChain.createArtwork(
                App.artworkTitle,
                parseInt(App.artworkYear),
                App.artworkMedium,
                App.artworkStyle,
                App.metaMaskAccountID, 
                App.originArtistName, 
                App.originArtistInfo, 
                App.originArtistLocation, 
                App.artistNotes
            )

            App.artworkID = result.logs[0].args.artworkID

            result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)
            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkID(App.artworkID)
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    frameArtwork: async function (event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form data and set on App object
            App.getOriginArtistID()

            await artSupplyChain.frameArtwork(App.artworkID, {from: App.originArtistID})

            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    adoptableArtwork: async function (event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form data and set on App object
            App.getOriginArtistID()
            App.getArtworkPrice()

            // Convert price to wei
            const artworkPrice = web3.toWei(App.artworkPrice, 'ether')
            await artSupplyChain.adoptableArtwork(App.artworkID, artworkPrice, {from: App.originArtistID})

            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    adoptArtwork: async function (event) {
        event.preventDefault()
        
        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form value 
            App.getArtAdopterID()

            const walletValue = web3.toWei(App.artworkPrice, "ether")
            await artSupplyChain.adoptArtwork(App.artworkID, App.metaMaskAccountID, {from: App.artAdopterID, value: walletValue})
            
            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artAdopterID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtAdopterID(App.artAdopterID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },
    
    packArtwork: async function (event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form value
            App.getOriginArtistID()

            await artSupplyChain.packArtwork(App.artworkID, {from: App.originArtistID})

            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    pickUpArtwork: async function (event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form value
            App.getShipperID()

            console.log(`App.shipperID = ${App.shipperID}`)

            await artSupplyChain.pickUpArtwork(App.artworkID, {from: App.shipperID})
            
            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    shipArtwork: async function (event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form value
            App.getShipperID()

            await artSupplyChain.shipArtwork(App.artworkID, {from: App.shipperID})
            
            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    deliverArtwork: async function (event) {
        event.preventDefault()

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            // Get the form value
            App.getShipperID()

            await artSupplyChain.deliverArtwork(App.artworkID, {from: App.shipperID})
            
            const result = await artSupplyChain.fetchArtworkOwnerAndState.call(App.artworkID)

            App.artworkOwnerID = result[0]
            App.artworkState = result[1]
            
            App.setArtworkOwnerID(App.artworkOwnerID)
            App.setArtworkState(App.artworkState)

        } catch (err) {
            App.setError(err.message)
        }
    },

    fetchArtworkItem: async function () {

        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            App.getArtworkID()

            let result = await artSupplyChain.fetchArtworkDetails.call(App.artworkID)

            // Update the App object with Artwork info
            App.artworkOwnerID = result[1]
            App.artworkTitle = result[2]
            App.artworkYear = parseInt(result[3])
            App.artworkMedium = result[4]
            App.artworkStyle = result[5]
            App.artworkPrice = parseInt(web3.fromWei(parseInt(result[6])))
            App.artistNotes = result[7]
            App.artworkState = parseInt(result[8])
            App.artAdopterID = result[9]
            App.shipperID = result[10]

            result = await artSupplyChain.fetchArtistDetails.call(App.artworkID)

            App.originArtistID = result[0]
            App.originArtistName = result[1]
            App.originArtistInfo = result[2]
            App.originArtistLocation = result[3]

        } catch (err) {
            App.setError('Artwork not found')
            App.initArtworkSpec()
        }

        App.updateArtworkSpec()
    },

    subscribeToEvents: async function () {
        if (typeof App.contract.ArtSupplyChain.currentProvider.sendAsync !== "function") {
            App.contract.ArtSupplyChain.currentProvider.sendAsync = () => {
                return App.contract.ArtSupplyChain.currentProvider.send.apply(App.contract.ArtSupplyChain.currentProvider, arguments)
            }
        }
        
        try {
            artSupplyChain = await App.contract.ArtSupplyChain.deployed()

            var events = artSupplyChain.allEvents((err, log) => {
                if (!err) {
                    $("#as-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>')
                }
            })
        } catch (err) {
            App.setError(err.message)
        }
    },

    getRequestID: function () {
        // Get user request (e.g. Create, Frame, Adopt, etc.)
        return parseInt($(event.target).data('id'))
    },

    setArtworkID: function(ID) {
        let val = (ID === 0 ? '' : `${ID}`)
        $("#artworkID").val(val)

        console.log(`setArtworkID = ${val}`)
    },

    getArtworkID: function () {
        let ID = $("#artworkID").val()
        App.artworkID = (ID === '' ? 0 : parseInt(ID))

        console.log(`getArtworkID = ${App.artworkID}`)
    },

    setArtworkOwnerID: function(ID) {
        let val = (ID === App.emptyAddress ? '' : ID)
        $("#artworkOwnerID").val(val)

        console.log(`setArtworkOwnerID = ${ID}`)
    },

    getArtworkOwnerID: function () {
        let ID = $("#artworkOwnerID").html()
        App.artworkOwnerID = (ID === '' ? App.emptyAddress : ID)

        console.log(`getArtworkOwnerID = ${App.artworkOwnerID}`)
    },

    setOriginArtistID: function(ID) {
        let val = (ID === App.emptyAddress ? '' : ID)
        $("#originArtistID").val(val)

        console.log(`setOriginArtistID = ${ID}`)
    },

    getOriginArtistID: function () {
        let ID = $("#originArtistID").val()
        App.originArtistID = (ID === '' ? null : ID)

        console.log(`getOriginArtistID = ${App.originArtistID}`)
    },

    setOriginArtistName: function(name) {
        let val = (name === null ? '' : name)
        $("#originArtistName").val(val)

        console.log(`setOriginArtistName = ${name}`)
    },

    getOriginArtistName: function () {
        let name = $("#originArtistName").val()
        App.originArtistName = (name === '' ? null : name)

        console.log(`getOriginArtistName = ${App.originArtistName}`)
    },

    setOriginArtistInfo: function(info) {
        let val = (info === null ? '' : info)
        $("#originArtistInfo").val(val)

        console.log(`setOriginArtistInfo = ${info}`)
    },

    getOriginArtistInfo: function () {
        let info = $("#originArtistInfo").val()
        App.originArtistInfo = (info === '' ? null : info)

        console.log(`getOriginArtistInfo = ${App.originArtistInfo}`)
    },

    setOriginArtistLocation: function(location) {
        let val = (location === null ? '' : location)
        $("#originArtistLocation").val(val)

        console.log(`setOriginArtistLocation = ${location}`)
    },

    getOriginArtistLocation: function () {
        let location = $("#originArtistLocation").val()
        App.originArtistLocation = (location === '' ? null : location)

        console.log(`getOriginArtistLocation = ${App.originArtistLocation}`)
    },

    setArtworkTitle: function(title) {
        let val = (title === null ? '' : title)
        $("#artworkTitle").val(val)

        console.log(`setArtworkTitle = ${title}`)
    },

    getArtworkTitle: function () {
        let title = $("#artworkTitle").val()
        App.artworkTitle = (title === '' ? null : title)

        console.log(`getArtworkTitle = ${App.artworkTitle}`)
    },

    setArtworkYear: function(year) {
        let val = (year === 0 ? '' : year)
        $("#artworkYear").val(val)

        console.log(`setArtworkYear = ${year}`)
    },

    getArtworkYear: function () {
        let year = $("#artworkYear").val()
        App.artworkYear = (year === '' ? 0 : year)

        console.log(`getArtworkYear = ${App.artworkYear}`)
    },

    setArtworkMedium: function(medium) {
        let val = (medium === null ? '' : medium)
        $("#artworkMedium").val(val)

        console.log(`setArtworkMedium = ${medium}`)
    },

    getArtworkMedium: function () {
        let medium = $("#artworkMedium").val()
        App.artworkMedium = (medium === '' ? null : medium)

        console.log(`getArtworkMedium = ${App.artworkMedium}`)
    },

    setArtworkStyle: function(style) {
        let val = (style === null ? '' : style)
        $("#artworkStyle").val(val)

        console.log(`setArtworkStyle = ${style}`)
    },

    getArtworkStyle: function () {
        let style = $("#artworkStyle").val()
        App.artworkStyle = (style === '' ? null : style)

        console.log(`getArtworkStyle = ${App.artworkStyle}`)
    },

    setArtistNotes: function(notes) {
        let val = (notes === null ? '' : notes)
        $("#artistNotes").val(val)

        console.log(`setArtistNotes = ${notes}`)
    },

    getArtistNotes: function () {
        let notes = $("#artistNotes").val()
        App.artistNotes = (notes === '' ? null : notes)

        console.log(`getArtistNotes = ${App.artistNotes}`)
    },

    getNewArtworkSpec: function () {
        // Clear these fields
        App.setArtworkID(0)
        App.setArtworkOwnerID(App.emptyAddress)
        App.setOriginArtistID(App.metaMaskAccountID)
        App.setArtworkPrice(0)
        App.setArtAdopterID(App.emptyAddress)
        App.setShipperID(App.emptyAddress)

        // Get the new artwork specs
        App.getOriginArtistName()
        App.getOriginArtistInfo()
        App.getOriginArtistLocation()
        App.getArtworkTitle()
        App.getArtworkYear()
        App.getArtworkMedium()
        App.getArtworkStyle()
        App.getArtistNotes()
    },

    setArtworkPrice: function (price) {
        let val = (price === 0 ? '' : price)
        $("#artworkPrice").val(val)

        console.log(`setArtworkPrice = ${price}`)
    },

    getArtworkPrice: function () {
        let price = $("#artworkPrice").val()
        App.artworkPrice = (price === '' ? 0 : price)

        console.log(`artwork price = ${App.artworkPrice}`)
    },

    setArtAdopterID: function (ID) {
        let val = (ID === App.emptyAddress ? '' : ID)
        $("#artAdopterID").val(val)

        console.log(`setArtAdopterID = ${ID}`)
    },

    getArtAdopterID: function () {
        let ID = $("#artAdopterID").val()
        App.artAdopterID = (ID === '' ? App.emptyAddress : ID)

        console.log(`setArtAdopterID = ${ID}`)
    },

    setShipperID: function (ID) {
        let val = (ID === App.emptyAddress ? '' : ID)
        $("#shipperID").val(val)

        console.log(`setShipperID = ${ID}`)
    },

    getShipperID: function () {
        let ID = $("#shipperID").val()
        App.shipperID = (ID === '' ? App.emptyAddress : ID)

        console.log(`getShipperID = ${ID}`)
    },

    initArtworkSpec: function () {
        App.artworkID = 0
        App.metaMaskAccountID = App.emptyAddress
        App.artworkOwnerID = App.emptyAddress
        App.originArtistID = App.emptyAddress
        App.originArtistName = null
        App.originArtistInfo = null
        App.originArtistLocation = null
        App.artworkTitle = null
        App.artworkYear = 0
        App.artworkMedium = null
        App.artworkStyle = null
        App.artistNotes = null
        App.artworkPrice = 0
        App.artworkState = -1
        App.artAdopterID =  App.emptyAddress
        App.shipperID = App.emptyAddress
    },

    updateArtworkSpec: function () {
        App.setArtworkID(App.artworkID)
        App.setArtworkState(App.artworkState)
        App.setArtworkOwnerID(App.artworkOwnerID)
        App.setOriginArtistID(App.originArtistID)
        App.setOriginArtistName(App.originArtistName)
        App.setOriginArtistInfo(App.originArtistInfo)
        App.setOriginArtistLocation(App.originArtistLocation)
        App.setArtworkTitle(App.artworkTitle)
        App.setArtworkYear(App.artworkYear)
        App.setArtworkMedium(App.artworkMedium)
        App.setArtworkStyle(App.artworkStyle)
        App.setArtistNotes(App.artistNotes)
        App.setArtworkPrice(App.artworkPrice)
        App.setArtAdopterID(App.artAdopterID)
        App.setShipperID(App.shipperID)
    },

    setArtworkState: function(artworkState) {
        $("#as-error").html('')
        $("#as-error").hide()
        $("#as-artworkState").html('')

        let status = ''

        switch (parseInt(artworkState)) {
            case 0:
                status = 'Artwork Created'
                break
            case 1:
                status = 'Artwork Framed'
                break
            case 2:
                status = 'Artwork Put Up For Adoption'
                break
            case 3:
                status = 'Artwork Adopted'
                break
            case 4:
                status = 'Artwork Packed'
                break
            case 5:
                status = 'Artwork Picked Up'
                break
            case 6:
                status = 'Artwork marked as Shipped'
                break
            case 7:
                status = 'Artwork has been Delivered'
                break
            default:
                status = 'Artwork not on Blockchain'
                App.setError(status)
                return
        }

        $("#as-artworkState").html(status)
    },

    setError: function (msg) {
        $("#as-artworkState").html('')
        $("#as-error").html(msg)
        $("#as-error").show()
    },
}

$(function () {
    $(window).load(function () {
        App.init()
    })
})
