"use client"
import type { NextPage } from 'next'
import { Wallet, HDNodeWallet, formatEther, parseEther } from 'ethers';
import { useState, useEffect } from 'react';
import { JsonRpcProvider } from 'ethers';
import CryptoJS from 'crypto-js';

import Input from "@/components/ui/password"




const Home: NextPage = () => {

    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [phrase, setPhrase] = useState('');
    const [wallet, setWallet] = useState<Wallet | HDNodeWallet | null>(null);

    const provider = new JsonRpcProvider('https://sepolia.infura.io/v3/8ddf83298b3349d99ce596eae7fdfd7a')
    const key = localStorage.getItem('encryptedPrivateKey');

    const createWallet = () => {
        const mnemonic = Wallet.createRandom().mnemonic;
        setPhrase(mnemonic.phrase);

        const wallet = HDNodeWallet.fromMnemonic(mnemonic!);

        wallet.connect(provider);
        setWallet(wallet);

        encryptAndStorePrivateKey();

        setStep(2);
    };
    const encryptAndStorePrivateKey = () => {
        const encryptedPrivateKey = CryptoJS.AES.encrypt(
            wallet!.privateKey,
            password
        ).toString();

        localStorage.setItem('encryptedPrivateKey', encryptedPrivateKey);
    };

    const [balance, setBalance] = useState('0');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('0');
    const [etherscanLink, setEtherscanLink] = useState('');

    const transfer = async () => {
        try {
            const transaction = await wallet.sendTransaction({
                to: recipientAddress,
                value: parseEther(amount),
            });

            setEtherscanLink(`https://sepolia.etherscan.io/tx/${transaction.hash}`);
        } catch (error) {
            console.error('Transaction error:', error);
        }
    };

    const loadWallet = async () => {
        const bytes = CryptoJS.AES.decrypt(key!, password);
        const privateKey = bytes.toString(CryptoJS.enc.Utf8);

        const wallet = new Wallet(privateKey, provider);
        setWallet(wallet);

        const balance = await wallet.provider.getBalance(wallet.address);
        setBalance(formatEther(balance!));
        setStep(3);
    };

    return (
        <div className="bg-[url('/bg-image.jpeg')] h-screen bg-no-repeat bg-cover bg-center bg-fixed text-white flex items-center justify-center">
            <div className="bg-stone-800 border-[2px] border-stone-500 rounded-2xl py-24 px-10 flex flex-col items-center justify-center h-[70%] w-[45%] max-w-[700px]">
                {step === 1 ? (
                    <>
                        {/*<input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />*/}
                        <Input onValueChange={(r) => setPassword(r)} />


                        <button onClick={() => (key ? loadWallet() : createWallet())}>
                            {key ? 'Load Wallet' : 'Create Wallet'}
                        </button>
                    </>
                ) : step === 2 ? (
                    <>
                        <p>Save the following prhase in a secure location</p>
                        <div>{phrase}</div>
                        <button onClick={() => setStep(3)}>Done</button>
                    </>
                ) : step === 3 && (
                    <>
                        <p>Wallet Address: {wallet?.address}</p>
                        <p>Balance: {balance}</p>

                        <p>Transfer to</p>

                        <div>
                            <input
                                placeholder="Recipient Address"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                            />

                            <input
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {etherscanLink && (
                            <a href={etherscanLink} target="_blank">
                                View on Etherscan
                            </a>
                        )}
                        <button onClick={transfer}>Transfer</button>
                    </>
                )}
            </div>
        </div>
    )
}

export default Home