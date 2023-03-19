// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SCL_AG_Token is ERC20, ERC20Burnable, Pausable, Ownable {

    string private _tokenName = "SCL_Token";
    string private _tokenSymbol = "SCL";
    uint8 private _decimals = 18;
    uint private _InitialTokenAmount = 100;
    uint private _RegistrationAgreementVersionNumber = 0;
    string private _RegistrationAgreement;
    address[] public lostAddresses;
    mapping(address => bool) public declaredLost;
    mapping(address => address) public recoveryAddresses;

    event NewRegisrationAgreement (uint indexed versionNumber, uint date, string linkToRegistrationAgreement);
    event _Announcement(uint date, string announcement);
    event RecoveryAddressSet(address _address, address _recoveryAddress);
    event AddressDeclaredLost(address _lostAddress);

    constructor() ERC20(_tokenName, _tokenSymbol) {_mint(msg.sender, _InitialTokenAmount * 10 ** _decimals);}

    // SCL Token SM holder has a pausable functioanlity in case of emergency. 
    // more details: https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#ERC20Pausable
    function pause() public onlyOwner {_pause();}

    function unpause() public onlyOwner {_unpause();}

    // The owner of the contract can mint (create) new tokens, increasing the total supply.
    function mint(address to, uint256 amount) public onlyOwner {_mint(to, amount);}

    // The owner of the contract can burn some tokens of its own, decreasing the total supply.
    function burn(uint256 amount) public onlyOwner override {super.burn(amount);}

    // The function burnFrom() inheritated from RC20Burnable.sol is disabled for this contract
    function burnFrom(address, uint256) public view override onlyOwner {
        revert("burnFrom() function has been disabled");}

    // The function renounceOwnership() inherited from Ownable.sol is disabled for this contract
    function renounceOwnership() public view override onlyOwner {
            revert("renounceOwnership function has been disabled");}

    // Overriding the decimals() function from ERC20.sol so that the funciton returns the number in the constructor
    function decimals() public view override returns (uint8) {return _decimals;}

    // Internal function that allows developers to extend a regular ERC20 Token by adding further functionalities.
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal whenNotPaused override {
        super._beforeTokenTransfer(from, to, amount);}

    // Function to set new registration aggreement.
    function set_registration_agreement(string memory _NewlinkToRegistrationAgreement) public onlyOwner returns(bool) {
        _RegistrationAgreementVersionNumber += 1;
        _RegistrationAgreement = _NewlinkToRegistrationAgreement;
        emit NewRegisrationAgreement(_RegistrationAgreementVersionNumber, block.timestamp, _NewlinkToRegistrationAgreement);
        return true;}

    // Function to access the latest registration agreement at all time.
    function registration_agreement() public view returns (string memory) {return _RegistrationAgreement;}

    // Function for the owner of the Token SM to make announcements.
    function Announcement(string memory _announcement) public onlyOwner returns(bool) {
        emit _Announcement(block.timestamp, _announcement);
        return true;}

    function setRecoveryAddress(address _recoveryAddress) external {
        recoveryAddresses[msg.sender] = _recoveryAddress;
        // (ERC20) to allow for future transfer from main account to recovery account the allowance is set to the total supply of BCP tokens. The transferred balance then cannot exceed the supply.
        approve(_recoveryAddress, totalSupply());
        // Send information about recovery address to the ATL website
        emit RecoveryAddressSet(msg.sender, _recoveryAddress);}

    function declareLost(address _lostAddress) public returns (bool) {
        // Checks that function is called from the recovery address indicated for the main token holder address. 
        // If no recovery address was set up, an error message will be displayed.
        require(msg.sender == recoveryAddresses[_lostAddress], "To call this function, you first must have set up a recovery address. Make sure your are calling the function from the recovery address you set up.");
        // Add the declared lost address to the lost addresses registry
        lostAddresses.push(_lostAddress);
        // Transfer of tokens from lost main account to recovery account
        uint256 _amount = balanceOf(_lostAddress);
        transferFrom(_lostAddress, msg.sender, _amount);
        // Emit information about lost address
        emit AddressDeclaredLost(_lostAddress);
        return(declaredLost[_lostAddress] = true);
    }
}
