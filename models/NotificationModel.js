const db = require("../db");

/** Related functions for notifications. */

class Notification {

  static async wasViewed(username) {
    // When a user views their notifications, set all of the user's 
    // notfication's was_viewed column to true
    await db.query(
      `UPDATE notifications
      SET was_viewed = true
      WHERE user_email = $1
      `, [username]);
  }

  static async addNotification(userEmail, text, category, relatedProductId ) {
    // Inserts a new notification.
    // - category parameter informs frontend which notification icon to display in list item.
    // - relatedProductId parameter to be passed in if notification is about a certain product. 
    //       Lets front end use the product's ID in url to link to the product's detail page.
  await db.query(
    `INSERT INTO notifications (user_email, text, category, related_product_id)
    VALUES ($1, $2, $3, $4)
    `, [userEmail, text, category, relatedProductId]);
  }
}



module.exports = Notification;
