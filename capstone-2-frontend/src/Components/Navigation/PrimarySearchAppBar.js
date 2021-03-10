import React, { useState, useContext, useEffect } from "react";
import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Popover from '@material-ui/core/Popover';

import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Context from "../Common/Context";
import {Redirect, useHistory} from 'react-router-dom';
import FreebayAPI from "../../Api.js"
import useStyles from "./Stylings/stylePrimarySearchAppBar.js"
import NotificationItem from "../User/NotificationItem"
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';



// Search Bar to allow user to search products.
// If logged in, displays user's account balance, notifications 
// icon, and profile icon. When clicked on, the notifications icon 
// will show user's unread notifications. If not logged in, shows 
// login and signup links.


function PrimarySearchAppBar() {
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState("");
  const [accountAnchorEl, setaccountAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const { currentUser, logout, } = useContext(Context);

  console.log("currentUser from PrimarySearchAppBar", currentUser)

  const history = useHistory()

  let notifications;
  let onlyNewNotifications;

  if (currentUser){
    notifications = currentUser.notifications;
    console.log("notifications from PrimarySearchAppBar", notifications)
    onlyNewNotifications = notifications.filter( n => !n.wasViewed)

  }

  const [newNotifications, setNewNotifications] = useState(onlyNewNotifications);

  function handleChange(evt) {
    setSearchTerm(evt.target.value);
    console.log("searchTerm", searchTerm)
  }

  // Handle functionality of the app bar
  const isAccountMenuOpen = Boolean(accountAnchorEl);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);
  const accountMenuId = isAccountMenuOpen ? 'simple-popover' : undefined;


  const handleProfileMenuOpen = (event) => {
    setaccountAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setaccountAnchorEl(null);
  };

  const handleNotificationsMenuOpen = (event) => {
    console.log("handleNotificationsMenuOpen")
    setNotificationsAnchorEl(event.currentTarget);
    setNewNotifications(0)
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  

  useEffect(function viewNotifications() {
    async function viewNotificationsApi() {
        try {
          await FreebayAPI.viewNotifications(currentUser.email);
        } catch (err) {
          console.error("Error with FreebayAPI.viewNotifications()", err);
        }
      }
    viewNotificationsApi();
  }, [notificationsAnchorEl]);


  // Handle the Input in the Search Bar
  function handleSubmit(evt) {
    evt.preventDefault();
    console.log("searchTerm from handleSubmit", searchTerm)
    let newUrl = `/products?name=` + searchTerm
    console.log("newUrl from the handlesubmit in searchbar",newUrl)
    history.push(newUrl)
   }
    

  const menuId = 'primary-search-account-menu';
  const renderAccountMenu = (
    <Popover
      anchorEl={accountAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isAccountMenuOpen}
      onClose={handleProfileMenuClose}
      className={classes.link}
    >
      { currentUser 
      ? 
        <Link href={"/Profile/" + currentUser.username} color="inherit" style={{ textDecoration: 'none' }}><MenuItem onClick={handleProfileMenuClose} className={classes.link}>Profile</MenuItem></Link>
      : 
        <MenuItem onClick={handleProfileMenuClose} className={classes.link}>Profile</MenuItem>
      } 
      <Link className="m-2" onClick={logout} color="inherit" className={classes.link} style={{ textDecoration: 'none' }}><MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem></Link>
    </Popover>
  );




  const renderNotificationsMenu = (
  
    <Popover
      anchorEl={notificationsAnchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isNotificationsMenuOpen}
      onClose={handleNotificationsMenuClose}
    >
    { currentUser
      ? ( onlyNewNotifications.length > 0
        ?
          onlyNewNotifications.map( n => (
          <MenuItem onClick={handleNotificationsMenuClose}>
            {( n.relatedProductId
            ? <Link href={"/product/"+ n.relatedProductId} 
                    color="inherit" 
                    style={{ textDecoration: 'none' }}
              >
                <NotificationItem n={n} />
              </Link>
            : <Link href={"/profile"} 
                    color="inherit" 
                    style={{ textDecoration: 'none' }}
              >
                <NotificationItem n={n} />
              </Link>
            )}
          </MenuItem>))
        :
        <MenuItem onClick={handleNotificationsMenuClose}>    
No new notifications
        </MenuItem>
        )
      : <div></div>
    }
    </Popover>
  );


  console.log(
    "PrimarySearchAppBar",
    "currentUser=", currentUser,
    "onlyNewNotifications=", onlyNewNotifications,
  );
    
  return (
    <div className={classes.grow}>
      <AppBar position="static" style= {{background: "#FFFFFF"}} elevation={0}>
        <Toolbar className= "flex">  
          <Link href="/">
            <img src="/images/logo.png" alt="logo" className={classes.logo}></img>
          </Link>
          <div className={classes.search}>
          <form onSubmit={handleSubmit} >
            <div className={classes.searchIcon}>
              <button type="submit" className={classes.searchButton} >
                <SearchIcon />
              </button>
            </div>
            <InputBase
              placeholder="Search for anything"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleChange}
            />
          </form>
          </div>
          {currentUser 
          ?  <div>

                <div className={classes.sectionDesktop}>
                <Typography className={classes.balance}>{"$" + currentUser.balance}</Typography>
                <IconButton aria-label="show notifications"
                onClick={handleNotificationsMenuOpen}>
                 <Badge badgeContent={newNotifications.length} color="secondary" >      
                      <NotificationsIcon 
                      edge="end"
                      aria-label="account of current user"
                      aria-controls={menuId}
                      aria-haspopup="true"/>
                    </Badge>
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  onClick={handleProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <AccountCircle />
                </IconButton>
              </div>
            </div>
          :  <div>
                <Button color="default" href="/login" className={classes.button}>Login</Button>
                <Button color="default" href="/signup" className={classes.button}>Signup</Button>
             </div>
          }
        </Toolbar>
      </AppBar>
      
      {renderNotificationsMenu}
      {renderAccountMenu}
    </div>
  )
}

export default PrimarySearchAppBar;