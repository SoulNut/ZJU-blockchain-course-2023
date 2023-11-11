import { Button, Card, Space, Image } from 'antd';
// import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from 'react';
import { web3, BorrowCarContract, GeoContract} from "../../utils/contract";
import { BigNumberish } from "ethers";
import './index.css';
import car1 from '../../assets/images/car1.jpg';
import car2 from '../../assets/images/car2.jpg';
import car3 from '../../assets/images/car3.jpg';
import car4 from '../../assets/images/car4.jpg';
import car5 from '../../assets/images/car5.jpg';
import car6 from '../../assets/images/car6.jpg';
import car7 from '../../assets/images/car7.jpg';
import car8 from '../../assets/images/car8.jpg';
import car9 from '../../assets/images/car9.jpg';
import car10 from '../../assets/images/car10.jpg';
import car11 from '../../assets/images/car11.jpg';
import car12 from '../../assets/images/car12.jpg';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache BorrowCar Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const BorrowCarPage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)
    const [accountBalanceString, setAccountBalanceString] = useState('')
    const [carList, setCarList] = useState<BigNumberish[]>([])
    const [availableCarList, setAvailableCarList] = useState<BigNumberish[]>([])
    const [queryCarId, setQueryCarId] = useState('')
    const [borrowCarId, setBorrowCarId] = useState('')
    const [returnCarId, setReturnCarId] = useState('')
    const [time, setTime] = useState('');
    const models = [car1, car2, car3, car4, car5, car6, car7, car8, car9, car10, car11, car12]

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }
        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (BorrowCarContract && GeoContract) {
                const ab = await GeoContract.methods.balanceOf(account).call()
                setAccountBalance(ab)
                const accountBalanceString = ab.toString();
                setAccountBalanceString(accountBalanceString);
            } else {
                alert('Contract not exists.')
            }
        }
        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    useEffect(() => {
        queryCarList()
        queryAvailableCars()
        updateCar()
      }, [account])

    const updateBalance = async () => {
        if (BorrowCarContract) {
            const ab = await BorrowCarContract.methods.queryBalance().call({
                from: account
            })
            setAccountBalance(ab)
            const accountBalanceString = ab.toString();
            setAccountBalanceString(accountBalanceString);
        }
    }

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowCarContract && GeoContract) {
            try {
                await GeoContract.methods.airdrop().send({
                    from: account
                })
                await updateBalance();
                alert('You have claimed Geo.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const AddCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowCarContract) {
            try {
                await BorrowCarContract.methods.createCar().send({
                    from: account
                })
                await queryCarList();
                await queryAvailableCars();
                await updateCar();
                alert('You have added the car.')
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const queryCarList = async () => {
        if (account === '') {
            return
        }
        if (BorrowCarContract) {
            try {
                setCarList(await BorrowCarContract.methods.queryOwnerCars().call({
                    from: account
                }))
            } catch (error: any) {
                alert(error.message)
            }
        }
    }

    const queryAvailableCars = async () => {
        if (account === '') {
            return
        }
        if (BorrowCarContract) {
            try {
                setAvailableCarList(await BorrowCarContract.methods.queryAvailableCars().call({
                    from: account
                }))
            } catch (error: any) {
                alert(error.message)
            }
        }
    }
    const queryCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowCarContract) {
            try {
                const owner =  await BorrowCarContract.methods.queryOwner(queryCarId).call()
                if(owner === '0x0000000000000000000000000000000000000000') {
                     alert('The car does not exit, Please check your input car ID')
                }
                else {
                    const borrower =  await BorrowCarContract.methods.queryBorrower(queryCarId).call()
                    if(borrower === '0x0000000000000000000000000000000000000000'){
                        alert('汽车ID: ' + queryCarId + '\n拥有者: ' + owner + '\n该车辆当前未被借用')
                    }
                    else
                        alert('汽车ID: ' + queryCarId + '\n拥有者: ' + owner + '\n借用者: ' + borrower)
                }
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const updateCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowCarContract && GeoContract) {
            try {
                await BorrowCarContract.methods.updateCar().send({
                    from: account
                })
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const borrowCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowCarContract && GeoContract) {
            try {
                const owner =  await BorrowCarContract.methods.queryOwner(borrowCarId).call()
                if(owner === '0x0000000000000000000000000000000000000000') {
                    alert('The car does not exit, Please check your input car ID')
                }
                else if(owner.toLowerCase() === account.toLowerCase()) {
                    alert('You are the owner of this car')
                }
                else {
                    const borrower =  await BorrowCarContract.methods.queryBorrower(borrowCarId).call()
                    if(borrower === '0x0000000000000000000000000000000000000000') {
                        await GeoContract.methods.approve(BorrowCarContract.options.address, time).send({
                            from: account
                        })
                        await BorrowCarContract.methods.borrowCar(borrowCarId, parseInt(time)).send({
                            from: account
                        })
                        alert('Borrow success.')
                    }
                    else
                        alert('The car is not available for borrowing')
                }
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const returnCar = async () => {
        if (account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        if (BorrowCarContract && GeoContract) {
            try {
                const owner =  await BorrowCarContract.methods.queryOwner(returnCarId).call()
                if(owner === '0x0000000000000000000000000000000000000000') {
                    alert('The car does not exit, Please check your input car ID')
                }
                else if(owner.toLowerCase() === account.toLowerCase()) {
                    alert('You are the owner of this car')
                }
                else {
                    const borrower =  await BorrowCarContract.methods.queryBorrower(returnCarId).call()
                    if(borrower.toLowerCase() === account.toLowerCase()) {
                        await BorrowCarContract.methods.returnCar(returnCarId).send({
                            from: account
                        })
                        alert('Return success.')
                    }
                    else
                        alert('The car is not available for returning')
                }
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    const onClickDisconnectWallet = async () => {
        setAccount('');
        setAvailableCarList([]);
        setCarList([]);
    }

    return (
        <div className='container'>
            <div className='main'>
                <h1>汽车借用系统</h1>
                <Space direction='vertical' size={16}>
                    <Card hoverable style={{ width: 600 }}>
                        <div className='account'>
                            <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                            <div>当前用户拥有吉欧数量：{account === '' ? '0' : accountBalanceString}</div>
                            {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                            {account !== '' && <Button onClick={onClickDisconnectWallet}>断开连接</Button>}
                        </div>
                    </Card>
                </Space>
                <br></br>
                <div>
                    <Button onClick={onClaimTokenAirdrop}>领取吉欧货币</Button>
                </div>
                <br></br>
                <br></br>
                <div>
                    <Button onClick={AddCar}>添加汽车</Button>
                </div>
                <br></br>
                <h2>我的汽车:</h2>
                <div style={{ height: '300px', overflow: 'auto' }}>
                    <Space direction='vertical' size={16}>
                        {carList.map((car, index) => (
                            <Card hoverable style={{ width: 600 }}>
                                <h3>{'Car' + index}</h3>
                                <img src={models[index % 12]} alt={models[index % 12]} style={{ width: '350px', height: '200px' }} />
                                <h3>{'ID: ' + car}</h3>
                            </Card>
                        ))}
                    </Space>
                </div>
                <h2>可借用汽车:</h2>
                <div style={{ height: '300px', overflow: 'auto' }}>
                    <Space direction='vertical' size={16}>
                        {availableCarList.map((car, index) => (
                            <Card hoverable style={{ width: 600 }}>
                                <h3>{'Car' + index}</h3>
                                <img src={models[index % 12]} alt={models[index % 12]} style={{ width: '350px', height: '200px' }} />
                                <h3>{'ID: ' + car}</h3>
                            </Card>
                        ))}
                        <Button onClick={updateCar}>更新可借用汽车</Button>
                    </Space>
                </div>
                <br></br>
                <br></br>
                <br></br>
                <h2>汽车查询:</h2>
                <Space direction='vertical' size={16}>
                    <Card hoverable style={{ width: 800 }}>
                        <div>
                            <span>汽车ID:</span>
                            <input type="number" 
                                style={{marginRight: '20px', width: '200px'}} 
                                value={queryCarId}
                                placeholder='请输入你要查询的汽车的ID'
                                onChange={e => setQueryCarId(e.target.value)} />
                            <Button style={{width: '200px'}} onClick={queryCar}>查询汽车</Button>
                        </div>
                    </Card>
                </Space>
                <br></br>
                <br></br>
                <br></br>
                <h2>汽车借用:</h2>
                <Space direction='vertical' size={16}>
                    <Card hoverable style={{ width: 800 }}>
                        <div>汽车借用说明: 你只能在余额大于所需借车费用时成功借用汽车, 且提前归还汽车不能退回借车费用</div>
                        <div>汽车借用价格: 每小时一个吉欧货币</div>
                        <div>
                            <span>汽车ID:</span>
                            <input type="number" 
                                style={{marginRight: '20px', width: '200px'}} 
                                value={borrowCarId}
                                placeholder='请输入你要借用的汽车的ID'
                                onChange={e => setBorrowCarId(e.target.value)} />
                            <span>借用时长:</span>
                            <input type="number" 
                                style={{marginRight: '20px', width: '200px'}} 
                                value={time}
                                placeholder='请输入你希望借用的时长(小时)'
                                onChange={e => setTime(e.target.value)} />
                            <Button style={{width: '200px'}} onClick={borrowCar}>借用汽车</Button>
                        </div>
                    </Card>
                </Space>
                <br></br>
                <br></br>
                <br></br>
                <h2>汽车归还:</h2>
                <Space direction='vertical' size={16}>
                    <Card hoverable style={{ width: 800 }}>
                        <div>汽车归还说明: 你只能归还自己借用汽车且未到期的汽车, 且提前归还汽车不能退回借车费用</div>
                        <div>
                            <span>汽车ID:</span>
                            <input type="number" 
                                style={{marginRight: '20px', width: '200px'}} 
                                value={returnCarId}
                                placeholder='请输入你要归还的汽车的ID'
                                onChange={e => setReturnCarId(e.target.value)} />
                            <Button style={{width: '200px'}} onClick={returnCar}>归还汽车</Button>
                        </div>
                    </Card>
                </Space>
            </div>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
        </div>
    )
}

export default BorrowCarPage