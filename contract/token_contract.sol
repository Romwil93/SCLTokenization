// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SCL_Equity_Token is ERC20, ERC20Burnable, Pausable, Ownable {

    string private _tokenName = "SCL_Token";
    string private _tokenSymbol = "SCL";
    uint8 private _decimals = 18;
    uint private _InitialTokenAmount = 100;
    uint private price;
    bool public offering = false;
    mapping(string => address) private identification;
    mapping(address => string) private reverseIdentification;
    mapping(string => bool) private availableCodes;
    mapping(address => address) public recoveryAddresses;
    mapping(address => bool) public declaredLost;
    mapping(string => address[]) public lostAddresses;
    event _Announcement(uint date, string announcement);
    event RecoveryAddressSet(address _address, address _recoveryAddress);
    event AddressDeclaredLost(address _lostAddress);
    modifier onlyRegistered {require(bytes(reverseIdentification[msg.sender]).length != 0); _;}
    modifier whenOffering {require(offering); _;}

    constructor() ERC20(_tokenName, _tokenSymbol) {_mint(msg.sender, _InitialTokenAmount * 10 ** _decimals);}

    function pause() public onlyOwner {_pause();}

    function unpause() public onlyOwner {_unpause();}

    function approveCode(string memory _code) public onlyOwner returns (bool) {
        availableCodes[_code] = true;
        return true;}

    function register(string memory _code) public returns(bool) {
        require(availableCodes[_code] == true, "This code is not available.");
        identification[_code] = msg.sender;
        availableCodes[_code] = false;
        return true;}

    function lookUpIdentifier(string memory _identifier) public onlyOwner view returns (address) {
        require(identification[_identifier] != address(0), "This code is not assigned.");
        return identification[_identifier];}

    function lookUpWallet(address _address) public onlyOwner view returns (string memory) {
        require(bytes(reverseIdentification[_address]).length != 0, "This wallet is not registered.");
        return reverseIdentification[_address];}

    function startOffering(uint _price) public onlyOwner returns (bool) {
        price = _price; offering = true; return true;}

    function stopOffering() public onlyOwner returns (bool) {
        price = 0; offering = false; return true;}
    
    function buyTokens() public payable whenOffering returns (bool) {
        uint _amount = msg.value / price;
        _mint(msg.sender, _amount);
        return true;}

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

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal whenNotPaused override {
        super._beforeTokenTransfer(from, to, amount);}

    function Announcement(string memory _announcement) public onlyOwner returns(bool) {
        emit _Announcement(block.timestamp, _announcement);
        return true;}

    function setRecoveryAddress(address _recoveryAddress) external {
        recoveryAddresses[msg.sender] = _recoveryAddress;
        approve(_recoveryAddress, totalSupply());
        emit RecoveryAddressSet(msg.sender, _recoveryAddress);}

    function declareLost(address _lostAddress) public returns (bool) {
        require(msg.sender == recoveryAddresses[_lostAddress], "To call this function, you first must have set up a recovery address. Make sure your are calling the function from the recovery address you set up.");
        uint256 _amount = balanceOf(_lostAddress);
        transferFrom(_lostAddress, msg.sender, _amount);
        emit AddressDeclaredLost(_lostAddress); // lost addresses need to be better stored
        return(declaredLost[_lostAddress] = true);}
}
