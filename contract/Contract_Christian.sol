// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC20 {
    struct InvestorData {
        uint256 tokenBalance;
        uint256 shareBalance;
        uint256 fractionalPartOfTokenBalance; // Updated
        bytes32 registrationHash;
        bool recoverable;
}
    mapping(address => InvestorData) public registry;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 public _totalSupply; // Total Supply of Tokens
    uint256 public constant ONE_SHARE = 1 ether; // 1 Share corresponds to 1e

    bool public paused;
    string private _name;
    string private _symbol;
    address public corporation;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Registered(address indexed account, bytes32 registrationHash);
    event AskedForRecovery(address indexed account);
    event Recovered(address indexed account);

    modifier whenUnpaused() {
        require(paused, "ERC20: token is not paused");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == corporation, "ERC20: only corporation can call this function");
        _;
    }

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        corporation = msg.sender;
        paused = false;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function pause() public onlyOwner whenUnpaused {
        paused = true;
    }

    function unpause() public onlyOwner {
        paused = false;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return registry[account].tokenBalance;
    }

    function shareBalanceOf(address account) public view returns (uint256) {
        return registry[account].shareBalance;
    }

    function fractionalShareBalanceOf(address account) public view virtual returns (uint256) {
        return registry[account].fractionalPartOfTokenBalance; // Updated
}

    function transfer(address to, uint256 amount) public whenUnpaused returns (bool) {
        require(amount <= registry[msg.sender].tokenBalance, "Token balance is not enough");
        uint256 shares = amount / ONE_SHARE;
        uint256 fractions = amount % ONE_SHARE;

        if (fractions > registry[msg.sender].fractionalPartOfTokenBalance) {
            registry[msg.sender].shareBalance -= 1;
            registry[corporation].shareBalance += 1;
            registry[msg.sender].fractionalPartOfTokenBalance += ONE_SHARE;
            registry[corporation].fractionalPartOfTokenBalance -= ONE_SHARE;
        }
        registry[msg.sender].shareBalance -= shares;
        registry[msg.sender].fractionalPartOfTokenBalance -= fractions;
        registry[msg.sender].tokenBalance -= amount;

        if (fractions < registry[to].fractionalPartOfTokenBalance) {
            registry[to].shareBalance += 1;
            registry[corporation].shareBalance -= 1;
            registry[to].fractionalPartOfTokenBalance -= ONE_SHARE;
            registry[corporation].fractionalPartOfTokenBalance += ONE_SHARE;
    }
        registry[to].shareBalance += shares;
        registry[to].fractionalPartOfTokenBalance += fractions;
        registry[to].tokenBalance += amount;

    return true;
}

function allowance(address owner, address spender) public view returns (uint256) {
    return _allowances[owner][spender];
}

function approve(address spender, uint256 amount) public returns (bool) {
    address owner = msg.sender;
    _approve(owner, spender, amount);
    return true;
}

function transferFrom(address from, address to, uint256 amount) public whenUnpaused returns (bool) {
    address spender = msg.sender;
    uint256 currentAllowance = allowance(from, spender);
    require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
    unchecked {
        _approve(from, spender, currentAllowance - amount);
    }
    _transfer(from, to, amount);
    return true;
}

function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
    address owner = msg.sender;
    _approve(owner, spender, allowance(owner, spender) + addedValue);
    return true;
}

function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
    address owner = msg.sender;
    uint256 currentAllowance = allowance(owner, spender);
    require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
    unchecked {
        _approve(owner, spender, currentAllowance - subtractedValue);
    }
    return true;
}

function _mint(address account, uint256 amount) internal virtual onlyOwner whenUnpaused {
    require(account != address(0), "ERC20: mint to the zero address");

    _totalSupply += amount;
    registry[corporation].shareBalance += amount / ONE_SHARE;
    registry[corporation].tokenBalance += amount;
    registry[corporation].fractionalPartOfTokenBalance += amount % ONE_SHARE;
   
    emit Transfer(address(0), account, amount);
}

function _burn(address account, uint256 amount) internal virtual onlyOwner whenUnpaused {
    require(account != address(0), "ERC20: burn from the zero address");

    uint256 accountBalance = registry[account].tokenBalance;
    require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
    registry[account].tokenBalance = accountBalance - amount;
    _totalSupply -= amount;

    emit Transfer(account, address(0), amount);
}

function _approve(address owner, address spender, uint256 amount) internal virtual {
    require(owner != address(0), "ERC20: approve from the zero address");
    require(spender != address(0), "ERC20: approve to the zero address");

    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
}

function _transfer(address from, address to, uint256 amount) internal virtual {
    require(from != address(0), "ERC20: transfer from the zero address");
    require(to != address(0), "ERC20: transfer to the zero address");
    require(amount <= registry[from].tokenBalance, "ERC20: transfer amount exceeds balance");

    registry[from].tokenBalance -= amount;
    registry[to].tokenBalance += amount;

    emit Transfer(from, to, amount);
}

function registerHash(bytes32 hash) public {
    registry[msg.sender].registrationHash = hash;
    emit Registered(msg.sender, hash);
}

function askForRecovery(address account) public payable {
    require(account != address(0), "ERC20: approveRecovery to the zero address");
    require(registry[account].registrationHash != 0, "ERC20: account must be registered");
    registry[account].recoverable = true;
    emit AskedForRecovery(account);
}

function recover(address oldAddress, address newAddress) public onlyOwner whenUnpaused {
    require(oldAddress != newAddress, "Lost address cannot be the same as new address");
    require(registry[oldAddress].registrationHash != 0, "Lost address must be registered");
    require(registry[newAddress].tokenBalance == 0, "New address must be registered");
    require(registry[newAddress].shareBalance == 0, "New address must be registered");
    require(registry[newAddress].fractionalPartOfTokenBalance == 0, "New address must be registered");
    require(registry[oldAddress].recoverable, "Address not marked for recovery");
    registry[newAddress] = registry[oldAddress];
    delete registry[oldAddress];
    emit Recovered(oldAddress);
}
}

