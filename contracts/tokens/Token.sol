//  SPDX-License-Identifier: MIT
//  @dev tg: defi_guru

pragma solidity ^0.7.4;


library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }
}

/**
 * BEP20 standard interface.
 */
interface IBEP20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function getOwner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address _owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * Allows for contract ownership along with multi-address authorization
 */
abstract contract Auth {
    address internal owner;
    mapping (address => bool) internal authorizations;

    constructor() {
        owner = msg.sender;
        authorizations[owner] = true;
    }

    /**
     * Function modifier to require caller to be contract owner
     */
    modifier onlyOwner() {
        require(isOwner(msg.sender), "!OWNER"); _;
    }

    /**
     * Function modifier to require caller to be authorized
     */
    modifier authorized() {
        require(isAuthorized(msg.sender), "!AUTHORIZED"); _;
    }

    /**
     * Authorize address. Owner only
     */
    function authorize(address adr) public onlyOwner {
        authorizations[adr] = true;
    }

    /**
     * Remove address' authorization. Owner only
     */
    function unauthorize(address adr) public onlyOwner {
        authorizations[adr] = false;
    }

    /**
     * Check if address is owner
     */
    function isOwner(address account) public view returns (bool) {
        return account == owner;
    }

    /**
     * Return address' authorization status
     */
    function isAuthorized(address adr) public view returns (bool) {
        return authorizations[adr];
    }

    /**
     * Transfer ownership to new address. Caller must be owner. Leaves old owner authorized
     */
    function transferOwnership(address payable adr) public onlyOwner {
        owner = adr;
        authorizations[adr] = true;
        emit OwnershipTransferred(adr);
    }

    event OwnershipTransferred(address owner);
}

interface IDEXFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IDEXRouter {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IDividendDistributor {
    function setDistributionCriteria(uint256 _minPeriod, uint256 _minDistribution, uint256 _minTokenBeforeDistribution) external;
    function setShare(address shareholder, uint256 amount) external;
    function deposit() external payable;
    function process(uint256 gas) external;
}

contract DividendDistributor is IDividendDistributor {
    using SafeMath for uint256;

    address _token;
    address public owner;

    struct Share {
        uint256 amount;
        uint256 totalExcluded;
        uint256 totalRealised;
    }

    IBEP20 public rewardToken;
    IDEXRouter router;

    address[] public shareholders;
    mapping (address => uint256) shareholderIndexes;
    mapping (address => uint256) shareholderClaims;

    mapping (address => Share) public shares;

    uint256 public totalShares;
    uint256 public totalDividends;
    mapping(address => uint256) public totalDistributed;
    mapping(address => mapping(address => uint256)) public userRewards;
    uint256 public dividendsPerShare;
    uint256 public dividendsPerShareAccuracyFactor = 10 ** 36;

    //SETMEUP, change this to 1 hour instead of 10mins
    uint256 public minPeriod;
    uint256 public minDistribution;
    uint256 public minTokenBeforeDistribution;

    uint256 currentIndex;

    bool public rewardTokenUpdateCycle;

    bool initialized;
    modifier initialization() {
        require(!initialized);
        _;
        initialized = true;
    }

    modifier onlyToken() {
        require(msg.sender == _token); _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner); _;
    }

    modifier notInRewardTokenUpdateCycle() {
        require(!rewardTokenUpdateCycle, "Updating Reward Token!"); _;
    }

    event RewardTokenUpdated(address token);
    event DistributionCriteriaUpdated(uint256 minPeriod, uint256 minDistribution, uint256 minTokenBeforeDistribution);

    constructor (address _owner, address _router, IBEP20 _rewardToken, uint256 _minPeriod, uint256 _minDistribution, uint256 _minTokenBeforeDistribution) {
        _token = msg.sender;
        router = IDEXRouter(_router);
        owner = _owner;
        rewardToken = _rewardToken;
        minPeriod = _minPeriod;
        minDistribution = _minDistribution;
        minTokenBeforeDistribution = _minTokenBeforeDistribution;
    }

    function updateRewardToken(IBEP20 _rewardToken, uint256 gas) external onlyOwner {
        if(!rewardTokenUpdateCycle) currentIndex = 0;
        rewardTokenUpdateCycle = true;
        distributeRewards(gas);
        if(shareholders.length == currentIndex) {
            rewardToken = _rewardToken;
            dividendsPerShare = 0;
            totalDividends = 0;
            rewardTokenUpdateCycle = false;
            emit RewardTokenUpdated(address(_rewardToken));
        }
    }

    function distributeRewards(uint256 gas) internal {
        uint256 shareholderCount = shareholders.length;

        if(shareholderCount == 0) { return; }

        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();

        while(gasUsed < gas && currentIndex < shareholderCount) {
            
            distributeDividend(shareholders[currentIndex]);
            shares[shareholders[currentIndex]].totalExcluded = 0;
            shares[shareholders[currentIndex]].totalRealised = 0;
            shareholderClaims[shareholders[currentIndex]] = 0;

            gasUsed = gasUsed.add(gasLeft.sub(gasleft()));
            gasLeft = gasleft();
            currentIndex++;
        }
    }
    
    function setDistributionCriteria(uint256 _minPeriod, uint256 _minDistribution, uint256 _minTokenBeforeDistribution) external override onlyToken notInRewardTokenUpdateCycle {
        minPeriod = _minPeriod;
        minDistribution = _minDistribution;
        minTokenBeforeDistribution = _minTokenBeforeDistribution;
        emit DistributionCriteriaUpdated(_minPeriod, _minDistribution, _minTokenBeforeDistribution);
    }

    function setShare(address shareholder, uint256 amount) external override onlyToken {
        if(shares[shareholder].amount > 0){
            distributeDividend(shareholder);
        }

        if(amount > 0 && shares[shareholder].amount == 0){
            addShareholder(shareholder);
        }else if(amount == 0 && shares[shareholder].amount > 0){
            removeShareholder(shareholder);
        }

        totalShares = totalShares.sub(shares[shareholder].amount).add(amount);
        shares[shareholder].amount = amount;
        shares[shareholder].totalExcluded = getCumulativeDividends(shares[shareholder].amount);
    }

    function deposit() external payable override onlyToken notInRewardTokenUpdateCycle {
        uint256 balanceBefore = rewardToken.balanceOf(address(this));

        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = address(rewardToken);

        router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: msg.value}(
            0,
            path,
            address(this),
            block.timestamp
        );

        uint256 amount = rewardToken.balanceOf(address(this)).sub(balanceBefore);

        totalDividends = totalDividends.add(amount);
        dividendsPerShare = dividendsPerShare.add(dividendsPerShareAccuracyFactor.mul(amount).div(totalShares));
    }

    function process(uint256 gas) external override onlyToken notInRewardTokenUpdateCycle {
        uint256 shareholderCount = shareholders.length;

        if(shareholderCount == 0) { return; }

        uint256 gasUsed = 0;
        uint256 gasLeft = gasleft();

        uint256 iterations = 0;

        while(gasUsed < gas && iterations < shareholderCount) {
            if(currentIndex >= shareholderCount){
                currentIndex = 0;
            }

            if(shouldDistribute(shareholders[currentIndex])){
                distributeDividend(shareholders[currentIndex]);
            }

            gasUsed = gasUsed.add(gasLeft.sub(gasleft()));
            gasLeft = gasleft();
            currentIndex++;
            iterations++;
        }
    }

    function shouldDistribute(address shareholder) internal view returns (bool) {
        return shareholderClaims[shareholder] + minPeriod < block.timestamp
                && getUnpaidEarnings(shareholder) > minDistribution;
    }

    function distributeDividend(address shareholder) internal {
        if(shares[shareholder].amount == 0){ return; }

        uint256 amount = getUnpaidEarnings(shareholder);
        if(amount > 0){
            totalDistributed[address(rewardToken)] = totalDistributed[address(rewardToken)].add(amount);
            rewardToken.transfer(shareholder, amount);
            shareholderClaims[shareholder] = block.timestamp;
            shares[shareholder].totalRealised = shares[shareholder].totalRealised.add(amount);
            shares[shareholder].totalExcluded = getCumulativeDividends(shares[shareholder].amount);
        }
    }
    
    function claimDividend() external notInRewardTokenUpdateCycle {
        distributeDividend(msg.sender);
    }

    function getUnpaidEarnings(address shareholder) public view returns (uint256) {
        if(shares[shareholder].amount == 0){ return 0; }

        uint256 shareholderTotalDividends = getCumulativeDividends(shares[shareholder].amount);
        uint256 shareholderTotalExcluded = shares[shareholder].totalExcluded;

        if(shareholderTotalDividends <= shareholderTotalExcluded){ return 0; }

        return shareholderTotalDividends.sub(shareholderTotalExcluded);
    }

    function getCumulativeDividends(uint256 share) internal view returns (uint256) {
        return share.mul(dividendsPerShare).div(dividendsPerShareAccuracyFactor);
    }

    function getShareHoldersLength() external view returns(uint256) {
        return shareholders.length;
    }

    function addShareholder(address shareholder) internal {
        shareholderIndexes[shareholder] = shareholders.length;
        shareholders.push(shareholder);
    }

    function removeShareholder(address shareholder) internal {
        shareholders[shareholderIndexes[shareholder]] = shareholders[shareholders.length-1];
        shareholderIndexes[shareholders[shareholders.length-1]] = shareholderIndexes[shareholder];
        shareholders.pop();
    }
}

contract TEST is IBEP20, Auth {
    using SafeMath for uint256;

    address DEAD = 0x000000000000000000000000000000000000dEaD;
    address ZERO = 0x0000000000000000000000000000000000000000;

    string constant _name = "TEST";
    string constant _symbol = "test";
    uint8 constant _decimals = 18;

    uint256 _totalSupply = 1_000_000_000e18;
    uint256 public _maxTxAmount = _totalSupply;

    //max wallet holding of 2% 
    uint256 public _maxWalletToken = _totalSupply;

    mapping (address => uint256) _balances;
    mapping (address => mapping (address => uint256)) _allowances;

    mapping (address => bool) isFeeExempt;
    mapping (address => bool) isTxLimitExempt;
    mapping (address => bool) isTimelockExempt;
    mapping (address => bool) isDividendExempt;

    uint256[] public reflectionFee;
    uint256[] public liquidityFee;
    uint256[] public marketingFee;
    uint256[] public devFee;
    uint256[] public buybackFee;
    uint256 reflectionFeeCollected;
    uint256 public liquidityFeeCollected;
    uint256 marketingFeeCollected;
    uint256 devFeeCollected;
    uint256 buybackFeeCollected;
    uint256 feeDenominator  = 10000;

    address public autoLiquidityReceiver;

    IDEXRouter public router;
    address public pair;

    address payable public marketingWallet;
    address payable public devWallet;
    address payable public buybackWallet;
 
    bool public tradingOpen = false;

    DividendDistributor public distributor;
    uint256 distributorGas = 500000;

    uint256 public whaleAmountThreshold = _totalSupply.div(100); // 1%

    // Cooldown & timer functionality
    bool public buyCooldownEnabled = true;
    uint8 public cooldownTimerInterval = 45;
    mapping (address => uint) private cooldownTimer;

    bool public swapEnabled = true;
    uint256 public swapThreshold = _totalSupply * 10 / 10000; // 0.01% of supply
    uint256 public buybackThreshold = 1000000000;
    bool inSwap;
    modifier swapping() { inSwap = true; _; inSwap = false; }

    event AutoLiquify(uint256 amountBNB, uint256 amountBOG);
    event AutoBuyBack(uint256 amount);

    constructor (
        address _router, IBEP20 _rewardToken, uint256 _mintPeriod, uint256 _minDistribution, uint256 _minTokenBeforeDistribution, address payable _marketingWallet, address payable _devWallet
        ) {
        // address _router = 0x10ED43C718714eb63d5aA57B78B54704E256024E;
        // IBEP20 _rewardToken = IBEP20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);
        // address payable _marketingWallet = 0x8e2e77173Db2FB17ce6609aa9a95cA0Abd54E3f8;
        // address payable _devWallet = 0xc9a5aE3f6D7440e56F581C1e3C95fAF21ea91D1b;
        // uint256 _mintPeriod = 10;
        // uint256 _minDistribution = 100;
        // uint256 _minTokenBeforeDistribution = 100;


        router = IDEXRouter(_router);
        pair = IDEXFactory(router.factory()).createPair(router.WETH(), address(this));
        _allowances[address(this)][address(router)] = uint256(-1);

        distributor = new DividendDistributor(_devWallet,_router,_rewardToken,_mintPeriod,_minDistribution,_minTokenBeforeDistribution);

        isFeeExempt[_devWallet] = true;
        isTxLimitExempt[_devWallet] = true;

        isTimelockExempt[_devWallet] = true;
        isTimelockExempt[DEAD] = true;
        isTimelockExempt[address(this)] = true;

        isDividendExempt[pair] = true;
        isDividendExempt[address(this)] = true;
        isDividendExempt[DEAD] = true;
        isDividendExempt[_devWallet] = true;

        autoLiquidityReceiver = DEAD;
        marketingWallet = _marketingWallet;
        devWallet = _devWallet;

        reflectionFee.push(100);
        reflectionFee.push(200);
        reflectionFee.push(300);
        reflectionFee.push(300);

        liquidityFee.push(100);
        liquidityFee.push(200);
        liquidityFee.push(300);
        liquidityFee.push(300);

        marketingFee.push(100);
        marketingFee.push(200);
        marketingFee.push(300);
        marketingFee.push(300);

        devFee.push(100);
        devFee.push(200);
        devFee.push(300);
        devFee.push(300);

        buybackFee.push(100);
        buybackFee.push(200);
        buybackFee.push(300);
        buybackFee.push(300);

        _balances[_devWallet] = _totalSupply;
        emit Transfer(address(0), _devWallet, _totalSupply);

        transferOwnership(_devWallet);
    }

    receive() external payable { }

    function totalSupply() external view override returns (uint256) { return _totalSupply; }
    function decimals() external pure override returns (uint8) { return _decimals; }
    function symbol() external pure override returns (string memory) { return _symbol; }
    function name() external pure override returns (string memory) { return _name; }
    function getOwner() external view override returns (address) { return owner; }
    function balanceOf(address account) public view override returns (uint256) { return _balances[account]; }
    function allowance(address holder, address spender) external view override returns (uint256) { return _allowances[holder][spender]; }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function approveMax(address spender) external returns (bool) {
        return approve(spender, uint256(-1));
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        return _transferFrom(msg.sender, recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        if(_allowances[sender][msg.sender] != uint256(-1)){
            _allowances[sender][msg.sender] = _allowances[sender][msg.sender].sub(amount, "Insufficient Allowance");
        }

        return _transferFrom(sender, recipient, amount);
    }

    function _transferFrom(address sender, address recipient, uint256 amount) internal returns (bool) {
        if(inSwap){ return _basicTransfer(sender, recipient, amount); }

        if(!authorizations[sender] && !authorizations[recipient]){
            require(tradingOpen,"Trading not open yet");
        }

        // max wallet code
        if (!authorizations[sender] && recipient != address(this)  && recipient != address(DEAD) && recipient != pair && recipient != marketingWallet && recipient != devWallet && recipient != autoLiquidityReceiver){
            uint256 heldTokens = balanceOf(recipient);
            require((heldTokens + amount) <= _maxWalletToken,"Total Holding is currently limited, you can not buy that much.");}
        
        // cooldown timer, so a bot doesnt do quick trades! 1min gap between 2 trades.
        if (sender == pair &&
            buyCooldownEnabled &&
            !isTimelockExempt[recipient]) {
            require(cooldownTimer[recipient] < block.timestamp,"Please wait for cooldown between buys");
            cooldownTimer[recipient] = block.timestamp + cooldownTimerInterval;
        }

        // Checks max transaction limit
        checkTxLimit(sender, recipient, amount);

        if(shouldSwap()){ swap(); }

        //Exchange tokens
        _balances[sender] = _balances[sender].sub(amount, "Insufficient Balance");

        uint256 amountReceived = shouldTakeFee(sender, recipient) ? takeFee(sender, recipient, amount) : amount;
        _balances[recipient] = _balances[recipient].add(amountReceived);

        // Dividend tracker
        if(!isDividendExempt[sender]) {
            try distributor.setShare(sender, _balances[sender]) {} catch {}
        }

        if(!isDividendExempt[recipient]) {
            try distributor.setShare(recipient, _balances[recipient]) {} catch {} 
        }

        try distributor.process(distributorGas) {} catch {}

        emit Transfer(sender, recipient, amountReceived);
        return true;
    }
    
    function _basicTransfer(address sender, address recipient, uint256 amount) internal returns (bool) {
        _balances[sender] = _balances[sender].sub(amount, "Insufficient Balance");
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function checkTxLimit(address sender, address recipient, uint256 amount) internal view {
        require(amount <= _maxTxAmount || isTxLimitExempt[sender] || isTxLimitExempt[recipient], "TX Limit Exceeded");
    }

    function shouldTakeFee(address sender, address recipient) internal view returns (bool) {
        return !inSwap && !isFeeExempt[sender] && !isFeeExempt[recipient];
    }

    function takeFee(address sender, address recipient, uint256 amount) internal returns (uint256) {
        uint256 i = amount >= whaleAmountThreshold ? 4 : sender == pair ? 0 : recipient == pair ? 1 : 2;
        uint256 totalFee = amount.mul(
                liquidityFee[i].add(reflectionFee[i]).add(marketingFee[i]).add(devFee[i]).add(buybackFee[i])
            ).div(feeDenominator);

        reflectionFeeCollected += reflectionFee[i].mul(amount).div(feeDenominator);
        liquidityFeeCollected += liquidityFee[i].mul(amount).div(feeDenominator);
        marketingFeeCollected += marketingFee[i].mul(amount).div(feeDenominator);
        devFeeCollected += devFee[i].mul(amount).div(feeDenominator);                                                                                                                                                       
        buybackFeeCollected += buybackFee[i].mul(amount).div(feeDenominator);

        _balances[address(this)] = _balances[address(this)].add(totalFee);
        emit Transfer(sender, address(this), totalFee);

        return amount.sub(totalFee);
    }

    function shouldSwap() internal view returns (bool) {
        return msg.sender != pair
        && !inSwap
        && swapEnabled
        && _balances[address(this)] >= swapThreshold;
    }

    // switch Trading
    function tradingStatus(bool _status) public onlyOwner {
        tradingOpen = _status;
    }

    // enable cooldown between trades
    function cooldownEnabled(bool _status, uint8 _interval) public onlyOwner {
        buyCooldownEnabled = _status;
        cooldownTimerInterval = _interval;
    }

    function swap() internal swapping {
        uint256 totalFee = reflectionFeeCollected
        .add(liquidityFeeCollected)
        .add(devFeeCollected)
        .add(marketingFeeCollected)
        .add(buybackFeeCollected);

        uint256 amountToLiquify = totalFee.mul(liquidityFeeCollected).div(totalFee).div(2);
        uint256 amountToSwap = totalFee.sub(amountToLiquify);

        address[] memory sellPath = new address[](2);
        sellPath[0] = address(this);
        sellPath[1] = router.WETH();

        uint256 balanceBefore = address(this).balance;
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountToSwap,
            0,
            sellPath,
            address(this),
            block.timestamp
        );

        uint256 amountBNB = address(this).balance.sub(balanceBefore);

        uint256 totalBNBFee = totalFee.sub(liquidityFeeCollected.div(2));
        
        uint256 amountBNBLiquidity = amountBNB.mul(liquidityFeeCollected).div(totalBNBFee).div(2);
        uint256 amountBNBMarketing = amountBNB.mul(marketingFeeCollected).div(totalBNBFee);
        uint256 amountBNBDev = amountBNB.mul(devFeeCollected).div(totalBNBFee);
        uint256 amountBNBBuyBack = amountBNB.mul(buybackFeeCollected).div(totalBNBFee);
        // uint256 amountBNBReflection = amountBNB.mul(reflectionFeeCollected).div(totalBNBFee);

        if(amountBNBMarketing > 0) marketingWallet.transfer(amountBNBMarketing);
        if(amountBNBDev > 0) devWallet.transfer(amountBNBDev);

        if(amountToLiquify > 0) {
            router.addLiquidityETH{value: amountBNBLiquidity}(
                address(this),
                amountToLiquify,
                0,
                0,
                autoLiquidityReceiver,
                block.timestamp
            );
            emit AutoLiquify(amountBNBLiquidity, amountToLiquify);
        }

        if(address(this).balance > buybackThreshold) {
            address[] memory path = new address[](2);
            path[0] = router.WETH();
            path[1] = address(this);

            uint256 _balanceBefore = balanceOf(DEAD);
            router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: amountBNBBuyBack}(
                    0,
                    path,
                    DEAD,
                    block.timestamp
                );
            uint256 buyBackAmount = balanceOf(DEAD).sub(_balanceBefore);
            _balances[DEAD] = _balances[DEAD].sub(buyBackAmount);
            _totalSupply = _totalSupply.sub(buyBackAmount);
            emit Transfer(address(this), address(0), buyBackAmount);
        }

        try distributor.deposit{value: address(this).balance}() {} catch {}

        reflectionFeeCollected = 0;
        liquidityFeeCollected = 0;
        marketingFeeCollected = 0;
        devFeeCollected = 0;
        buybackFeeCollected = 0;
    }

     function setMaxWalletPercent(uint256 maxWallPercent) external onlyOwner() {
        _maxWalletToken = (_totalSupply * maxWallPercent ) / 100;
    }

    function setTxLimit(uint256 amount) external authorized {
        _maxTxAmount = amount;
    }

    function setWhaleAmountThresholdPercent(uint256 percent) external authorized {
        whaleAmountThreshold = (_totalSupply * percent) / 100;
    }

    function setIsDividendExempt(address holder, bool exempt) external authorized {
        require(holder != address(this) && holder != pair);
        isDividendExempt[holder] = exempt;
        if(exempt){
            distributor.setShare(holder, 0);
        }else{
            distributor.setShare(holder, _balances[holder]);
        }
    }

    function setIsFeeExempt(address holder, bool exempt) external authorized {
        isFeeExempt[holder] = exempt;
    }

    function setIsTxLimitExempt(address holder, bool exempt) external authorized {
        isTxLimitExempt[holder] = exempt;
    }

    function setIsTimelockExempt(address holder, bool exempt) external authorized {
        isTimelockExempt[holder] = exempt;
    }
    
    function setSwapSettings(bool _enabled, uint256 _swapThreshold, uint256 _buybackThreshold) external authorized {
        swapEnabled = _enabled;
        swapThreshold = _swapThreshold;
        buybackThreshold = _buybackThreshold;
    }

    function setDistributionCriteria(uint256 _minPeriod, uint256 _minDistribution, uint _minTokensBeforeDistribution) external authorized {
        distributor.setDistributionCriteria(_minPeriod, _minDistribution, _minTokensBeforeDistribution);
    }

    function setDistributorSettings(uint256 gas) external authorized {
        require(gas < 750000);
        distributorGas = gas;
    }

    function setLiquidityFee(uint256 buy, uint256 sell, uint256 p2p, uint256 whaleTax) external authorized {
        liquidityFee[0] = buy;
        liquidityFee[1] = sell;
        liquidityFee[2] = p2p;
        liquidityFee[3] = whaleTax;
    }

    function setRelfectionFee(uint256 buy, uint256 sell, uint256 p2p, uint256 whaleTax) external authorized {
        reflectionFee[0] = buy;
        reflectionFee[1] = sell;
        reflectionFee[2] = p2p;
        reflectionFee[3] = whaleTax;
    }

    function setMarketingFee(uint256 buy, uint256 sell, uint256 p2p, uint256 whaleTax) external authorized {
        marketingFee[0] = buy;
        marketingFee[1] = sell;
        marketingFee[2] = p2p;
        marketingFee[3] = whaleTax;
    }

    function setDevFee(uint256 buy, uint256 sell, uint256 p2p, uint256 whaleTax) external authorized {
        devFee[0] = buy;
        devFee[1] = sell;
        devFee[2] = p2p;
        devFee[3] = whaleTax;
    }

    function setBuybackFee(uint256 buy, uint256 sell, uint256 p2p, uint256 whaleTax) external authorized {
        buybackFee[0] = buy;
        buybackFee[1] = sell;
        buybackFee[2] = p2p;
        buybackFee[3] = whaleTax;
    }

    function setWallets(address _autoLiquidityReceiver, address payable _marketingWallet, address payable _devWallet, address payable _buybackWallet) external authorized {
        autoLiquidityReceiver = _autoLiquidityReceiver;
        marketingWallet = _marketingWallet;
        devWallet = _devWallet;
        buybackWallet = _buybackWallet;
    }

}