// SPDX-License-Identifier: UNLICENSED
pragma solidity  ^0.8.20;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed by TA already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Uncomment this line to use console.log
import "./token.sol";
// import "hardhat/console.sol";

contract BorrowYourCar is ERC721 {

    // use a event if you want
    // to represent time you can choose block.timestamp
    event CarBorrowed(uint256 index, address borrower, uint256 startTime, uint256 duration);
    event CarReturned(uint256 index);

    // maybe you need a struct to store car information
    struct Car {
        address owner;
        address borrower;
        uint256 borrowUntil;
        bool isBorrowed;
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information

    mapping(address => uint256[]) public ownerlist;

    uint256[] public BorrowedCars;
    uint256[] public ReturnedCars;

    Geo public geo;

    constructor(address tokenAddress)ERC721("BorrowYourCar", "cars"){
        geo = Geo(tokenAddress);
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    function createCar() public {
        uint256 index = block.timestamp + uint256(blockhash(block.number - 1)) % 1000;
        _safeMint(msg.sender, index);
        cars[index] = Car(msg.sender, address(0), 0, false);
        ownerlist[msg.sender].push(index);
        ReturnedCars.push(index);
    }

    function createGeo() public {
        geo.create(msg.sender);
    }

    function queryAvailableCars() external view returns (uint256[] memory) {
        return ReturnedCars;
    }

    function queryBorrowedCars() external view returns (uint256[] memory) {
        return BorrowedCars;
    }

    function queryOwnerCars() external view returns (uint256[] memory) {
        return ownerlist[msg.sender];
    }

    function queryOwner(uint256 index) public view returns(address){
        Car storage target =  cars[index];
        return target.owner;
    }

    function queryBorrower(uint256 index) public view returns(address){
        if( uint256(cars[index].borrowUntil) >=  block.timestamp) {
            return cars[index].borrower;
        }
        else {
            return address(0);
        }
    }

    function queryBalance() public view returns (uint256) {
        uint256 balance = geo.balanceOf(msg.sender);
        return balance;
    }

    function updateCar() external {
        for (uint i = 0; i < BorrowedCars.length; ++i) {
            if (uint256(cars[BorrowedCars[i]].borrowUntil) < block.timestamp) {
                cars[BorrowedCars[i]].isBorrowed = false;
                ReturnedCars.push(BorrowedCars[i]);
                deleteElement(BorrowedCars, BorrowedCars[i]);
            }
        }
    }

    function deleteElement(uint256[] storage list, uint256 value) internal {
        for (uint i = 0; i < list.length; ++i) {
            if (list[i] == value) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }

    function deleteAvailableCar(uint256 index) external {
        Car storage target =  cars[index];
        require(target.isBorrowed != true, "The car has not been returned");
        delete cars[index];
        address owner = queryOwner(index);
        uint256[] storage carlist = ownerlist[owner];
        deleteElement(carlist, index);
        deleteElement(ReturnedCars, index);
    }

    function deleteCar(uint256 index) external {
        Car storage target =  cars[index];
        delete cars[index];
        address owner = queryOwner(index);
        uint256[] storage carlist = ownerlist[owner];
        deleteElement(carlist, index);
        if(target.isBorrowed == true) {
            deleteElement(BorrowedCars, index);
        }
        else {
            deleteElement(ReturnedCars, index);
        }
    }

    function borrowCar(uint256 index, uint256 duration) external {
        require(queryOwner(index) != msg.sender, "You are the owner of this car");
        Car storage target = cars[index];
        require(target.isBorrowed != true, "Car is not available for borrowing");
        uint256 cost = duration / 3600;
        require(geo.balanceOf(msg.sender) >= cost, "Your balance is insufficient");
        geo.transferFrom( msg.sender, target.owner, cost);
        target.isBorrowed = true;
        target.borrower = msg.sender;
        target.borrowUntil = block.timestamp + duration;
        deleteElement(ReturnedCars, index);
        BorrowedCars.push(index);
        emit CarBorrowed(index, msg.sender, block.timestamp, duration);
    }

    function returnCar(uint256 index) external {
        require(queryOwner(index) != msg.sender, "You are the owner of this car");
        Car storage target = cars[index];
        require(target.isBorrowed, "Car has already been returned");
        target.isBorrowed = false;
        target.borrower = address(0);
        target.borrowUntil = 0;
        deleteElement(BorrowedCars, index);
        ReturnedCars.push(index);
        emit CarReturned(index);
    }
}