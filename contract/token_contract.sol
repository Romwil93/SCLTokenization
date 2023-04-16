// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SCL_Equity_Token is ERC20, ERC20Burnable, Pausable, Ownable {

    string private tokenName = "SCL_Token";
    string private tokenSymbol = "SCL";
    uint8 private _decimals = 18;
    uint private _initialTokenAmount = 100;
    uint public offeringPrice = 0;
    uint public offeringAmount = 0;
    bool public offering = false;
    mapping(string => address) private identification;
    mapping(address => string) private reverseIdentification;
    mapping(string => bool) private availableCodes;
    mapping(address => address) public recoveryAddresses;
    mapping(address => string) public declaredLost;
    event _Announcement(uint date, string announcement);
    event RecoveryAddressSet(address _address, address _recoveryAddress);
    event AddressDeclaredLost(string _identifier, address _lostAddress);
    event InvestorRegistered(string _identifier, address _address);
    modifier onlyRegistered {require(bytes(reverseIdentification[msg.sender]).length != 0); _;}
    modifier whenOffering {require(offering); _;}

    constructor() ERC20(tokenName, tokenSymbol) {_mint(msg.sender, _initialTokenAmount * 10 ** _decimals);}

    function pause() public onlyOwner {_pause();}

    function unpause() public onlyOwner {_unpause();}

    function approveCode(string memory _code) public onlyOwner returns (bool) {
        availableCodes[_code] = true;
        return true;}

    function registerInvestor(string memory _code) public returns(bool) {
        require(availableCodes[_code] == true, "This code is not available.");
        identification[_code] = msg.sender; reverseIdentification[msg.sender] = _code;
        availableCodes[_code] = false;
        emit InvestorRegistered(_code, msg.sender);
        return true;}

    function lookUpIdentifier(string memory _identifier) public onlyOwner view returns (address) {
        require(identification[_identifier] != address(0), "This code is not assigned.");
        return identification[_identifier];}

    function lookUpWallet(address _address) public onlyOwner view returns (string memory) {
        require(bytes(reverseIdentification[_address]).length != 0, "This wallet is not registered.");
        return reverseIdentification[_address];}

    function startOffering(uint _price, uint _amount) public onlyOwner returns (bool) {
        offeringPrice = _price; offering = true; offeringAmount = _amount * 10 ** _decimals;
        return true;}

    function stopOffering() public onlyOwner returns (bool) {
        offeringPrice = 0; offering = false; return true;}

    function buyTokens() public payable whenOffering returns (uint) {
        uint _amount = msg.value / offeringPrice;
        if (_amount > offeringAmount) {
            uint repayment = (msg.value - (offeringAmount * offeringPrice));
            payable(msg.sender).transfer(repayment);
            _amount = offeringAmount;
            stopOffering();}
        _mint(msg.sender, _amount);
        offeringAmount -= _amount;
        return _amount;}

    function withdraw() public onlyOwner returns (bool) {
        payable(msg.sender).transfer(address(this).balance);
        return true;}

    function mint(address to, uint256 amount) public onlyOwner {_mint(to, amount);}

    function burn(uint256 amount) public onlyOwner override {super.burn(amount);}

    function burnFrom(address, uint256) public view override onlyOwner {
        revert("The burnFrom-function has been disabled.");}

    function renounceOwnership() public view override onlyOwner {
        revert("The renounceOwnership-function has been disabled");}

    function decimals() public view override returns (uint8) {return _decimals;}

    function _beforeTokenTransfer(address _from, address _to, uint256 _amount) internal whenNotPaused override {
        super._beforeTokenTransfer(_from, _to, _amount);}

    function announcement(string memory _announcement) public onlyOwner returns(bool) {
        emit _Announcement(block.timestamp, _announcement); return true;}

    function setRecoveryAddress(address _recoveryAddress) external {
        recoveryAddresses[msg.sender] = _recoveryAddress;
        approve(_recoveryAddress, totalSupply()); //weird formulation
        emit RecoveryAddressSet(msg.sender, _recoveryAddress);}

    function declareLost(address _lostAddress) public returns (bool) {
        require(msg.sender == recoveryAddresses[_lostAddress], "To call this function, you first must have set up a recovery address. Make sure your are calling the function from the recovery address you set up.");
        uint256 _amount = balanceOf(_lostAddress);
        transferFrom(_lostAddress, msg.sender, _amount);
        emit AddressDeclaredLost(reverseIdentification[_lostAddress], _lostAddress);
        emit InvestorRegistered(reverseIdentification[_lostAddress], msg.sender);
        declaredLost[_lostAddress] = lookUpWallet(_lostAddress);
        reverseIdentification[msg.sender] = reverseIdentification[_lostAddress];
        reverseIdentification[_lostAddress] = "";
        identification[reverseIdentification[_lostAddress]] = msg.sender;
        return true;}
}
