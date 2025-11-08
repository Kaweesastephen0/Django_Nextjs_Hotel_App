"use client"
import { logoutUser, getUserInfo } from "../../utils/auth";
import { useState, useEffect} from "react";
import Header from "./components/header/Header";
import Featured from "./components/featured/Featured";
import PropertyList from "./components/propertyList/PropertyList";
import FeaturedProperties from "./components/featuredProperties/FeaturedProperties";
import MailList from "./components/mailList/MailList";
import Footer from "./components/footer/Footer";
import 'react-loading-skeleton/dist/skeleton.css';

export default function Home() {
 

  return (
    <div >
      <Header/>
      <div className="homeContainer">
        <h1 className="homeTitle">Featured Hotels</h1>
        <Featured/>
        <h1 className="homeTitle">Browse by property type</h1>
        <PropertyList/>
        <h1 className="homeTitle">Homes guests love</h1>
        <FeaturedProperties/>
        <MailList/>
        <Footer/>
      </div>
    </div>
  );
}
