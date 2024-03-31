"use client"
import type { NextPage } from 'next'
import { Wallet, HDNodeWallet, formatEther, parseEther } from 'ethers';
import { useState, useEffect } from 'react';
import { JsonRpcProvider } from 'ethers';
import CryptoJS from 'crypto-js';
import { useCallback } from 'react';

import Password from "@/components/ui/password"
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Number from '@/components/ui/number';




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

    const [copyButton, setCopyButton] = useState('copy');
    const copyWalletToClipboard = useCallback(() => {
        if (wallet) {
            navigator.clipboard.writeText(wallet.address);
            setCopyButton('copied');
            setTimeout(() => {
                setCopyButton('copy')
            }, 2000)
        }
    }, [wallet]);

    useEffect(() => {
        if (key) {
            setStep(3);
            loadWallet();
        }
    }, []);

    return (
        <div className="bg-[url('/bg-image.jpeg')] font-mono h-screen bg-no-repeat bg-cover bg-center bg-fixed text-white flex items-center justify-center">
            <div className="bg-stone-800 border-[2px] border-stone-500 rounded-2xl py-14 px-10 flex flex-col items-center justify-center h-[70%] w-[45%] max-w-[700px] -mt-[5%]">
                {step === 1 ? (
                    <div className="flex flex-col gap-8 w-full">
                        <Password onValueChange={(r) => setPassword(r)} />
                        <Button onClick={() => (key ? loadWallet() : createWallet())}>{key ? 'Load Wallet' : 'Create Wallet'}</Button>
                    </div>
                ) : step === 2 ? (
                    <>
                        <p>Save the following prhase in a secure location</p>
                        <div>{phrase}</div>
                        <button onClick={() => setStep(3)}>Done</button>
                    </>
                ) : step === 3 && (
                    <div className="h-full w-full">
                        <div className="border-b-[1px] gap-1 flex flex-col pb-3 border-b-stone-500 -mt-8 -mx-5">
                            <p className="text-sm">
                                <span className="text-xs">My Address: </span>
                                {wallet?.address}
                                <span onClick={copyWalletToClipboard} className="px-1 py-1 ml-2 cursor-pointer rounded-lg bg-stone-400 hover:bg-stone-500 duration-300">
                                    {copyButton}
                                </span>
                            </p>
                            <p className="text-2xl"><span className="text-xs">Balance: </span>{balance} Eth</p>
                        </div>
                        <div className="pt-10">
                            <p className="text-xl">Transfer</p>
                            <Input onValueChange={(r) => setRecipientAddress(r)} placeHolder={'Recipient Address'} />
                            <div className="mt-2 flex flex-row gap-2">
                                <Number onValueChange={(r) => { setAmount(r) }} />
                                <Button onClick={transfer} children={"Transfer"} />
                            </div>
                            {etherscanLink && (
                                <a href={etherscanLink} target="_blank">
                                    View on Etherscan
                                </a>
                            )}
                        </div>
                        <div className="pt-10">
                            <p className="text-xl">History</p>

                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Home