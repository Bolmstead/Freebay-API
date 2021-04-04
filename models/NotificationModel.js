const db = require("../db");

/** Related functions for notifications. */

class Notification {
  // When a user views their notifications, set all their 
  // notfication's was_viewed columns to true
  static async wasViewed(email) {
    await db.query(
      `UPDATE notifications
      SET was_viewed = true
      WHERE user_email = $1
      `, [email]);
  }

  // Inserts a new notification.
  // - category parameter informs frontend which notification icon to display in list item.
  // - relatedProductId parameter to be passed in if notification is about a certain product. 
  // Lets front end use product's ID in url link to the product's detail page.
  static async add(userEmail, text, category, relatedProductId ) {
  await db.query(
    `INSERT INTO notifications (user_email, text, category, related_product_id)
    VALUES ($1, $2, $3, $4)
    `, [userEmail, text, category, relatedProductId]);
  }
}



module.exports = Notification;
