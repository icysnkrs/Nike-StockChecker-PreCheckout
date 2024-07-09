"use strict"

const axios =  require("axios");
const fs = require("fs");
const { availableCountries } = require("./regions/nikeCountries.js");
const { EmbedBuilder } = require("discord.js");
const { release } = require("os");
const { channel } = require("diagnostics_channel");


// Adding proxy for fetching [ONLY IF YOU WANT, CAN BE USED LOCALLY TOO BUT I RECOMMEND USING A PROXY]
const proxy = {
            protocol: "http",
            host: "",
            port: 123123123, //Number, not string
            auth: {
                username: "",
                password: ""
            }
        }  


async function executeSNKRS(interaction) {
  let region = interaction.options.get("region").value.toUpperCase();

  if(region.length == 2) {
  const marketplaceLanguage = availableCountries[region.toUpperCase()].language;
  const instance = axios.create ({proxy: proxy})
    try {
       const response = await instance.get(`https://api.nike.com/product_feed/threads/v3/?anchor=0&filter=marketplace(${region})&filter=language(${marketplaceLanguage})&filter=upcoming(true)&filter=channelId(010794e5-35fe-4e32-aaff-cd2c74f89d61)`);
       const snkrsResponse = response.data;
       let loadedProductsNumber;
       const embed = new EmbedBuilder()
      .setURL(`https://www.nike.com/${region}/launch?s=upcoming`)
      .setTitle("Upcoming Nike SNKRS Releases:")
      .setColor("#348feb")
      .setTimestamp()
      .setFooter({ text:"Icy's project", iconURL:"https://imgur.com/PBOj3cj"})
      
      for (let i = 0; i < snkrsResponse.objects.length; ++i) {

          loadedProductsNumber =+ i;
          const productInfo = snkrsResponse.objects[i].productInfo[0];
          const merchProduct = productInfo?.merchProduct || {};
          const launchView = productInfo?.launchView || {};
          const merchPrice = productInfo?.merchPrice || {};
          const styleColor = merchProduct.styleColor || "N/A";
          const method = launchView.method || "FLOW";
          const fullPrice = merchPrice.fullPrice || "N/A";
          const currency = merchPrice.currency || "N/A";
          let name = `🍊 ${merchProduct.labelName} 🍊`;
          let startEntryDate = launchView.startEntryDate || "N/A";
          // Converting date from api to a better read
          let convertDate = startEntryDate;
          const time = new Date(convertDate);
          const day = time.getDate().toString().padStart(2, '0');
          const month = (time.getMonth() + 1).toString().padStart(2, '0');
          const year = time.getFullYear();
          const hour = time.getHours().toString().padStart(2, '0');
          const minutes = time.getMinutes().toString().padStart(2, '0')
  
          if(startEntryDate === "N/A") {
              name = `🍏 ${merchProduct.labelName} 🍏 💥LIVE💥`;
              startEntryDate = "Product can be purchased";
          } else {
              convertDate = `${day}/${month}/${year}, ${hour}:${minutes}`
              startEntryDate = convertDate;
          }
          embed.addFields(
              { 
                  name: "\u2008",
                  value: `**${name}**\nSKU: **${styleColor}**\nRelease Method: **${method}**\nPrice: **${fullPrice} ${currency}**\nRelease date: **${startEntryDate}**\nLINK: https://www.nike.com/${region.toLowerCase()}/launch/r/${styleColor}`,
              }
          );
      }
      embed.addFields({
        name: `LIVE PRODUCTS: ${loadedProductsNumber}`, value: `\u2008`
      })
     await interaction.reply({embeds: [embed]})
    }
    catch (error) {
        console.error ("Error using command /snkrs:", error);
        throw error
    }
  } else {
    interaction.reply(`Region must have 2 letters! Ex: Romania = RO`)
  }
}
async function executeNIKE(interaction) {
  const sku = interaction.options.get("sku").value.toUpperCase();
  const region = interaction.options.get("region").value.toUpperCase();
  if (sku.length == 10 && region.length == 2) {
  const countryEmoji = availableCountries[region.toUpperCase()].emoji;
  const marketplaceLanguage = availableCountries[region.toUpperCase()].language;
  const instance = axios.create ({proxy: proxy});
  let nikeResponse, response, secondResponse, found, channelId;
  try {
    channelId = `d9a5bc42-4b9c-4976-858a-f159cf99c647,008be467-6c78-4079-94f0-70e2d6cc4003`; // Nike Channels for NDC,SNKRS,APP (82a74ac1-c527-4470-b7b0-fb5f3ef3c2e2 - APP)
    response = await instance.get(`https://api.nike.com/product_feed/threads/v2?filter=language(${marketplaceLanguage})&filter=marketplace(${region})&filter=channelId(${channelId})&filter=productInfo.merchProduct.styleColor(${sku})`)
    if (response.data.objects.length === 0) {
      channelId = `16134d36-74f2-11ea-bc55-00242ac13000`; // Experiences
      secondResponse = await instance.get(`https://api.nike.com/product_feed/threads/v2?filter=language(${marketplaceLanguage})&filter=marketplace(${region})&filter=channelId(${channelId})&filter=productInfo.merchProduct.styleColor(${sku})`)
      if (secondResponse.data.objects.length === 0) {
        await interaction.reply(`Product was not found!`)
      } else {
        found = true;
      }
    }
    if (found == true) {
      nikeResponse = secondResponse.data;
    } else {
      nikeResponse = response.data;
    }
    const productInfo = nikeResponse.objects[0].productInfo[0];
    const publishedContent = nikeResponse.objects[0].publishedContent;
    const productImage = publishedContent.properties.productCard.properties.squarishURL;
    const productName = productInfo.productContent.fullTitle;
    const productSku = `${productInfo.merchProduct.styleColor}`;
    const productFullPrice = `${productInfo.merchPrice.fullPrice} ${productInfo.merchPrice.currency}`;
    const productCurrentPrice = `${productInfo.merchPrice.currentPrice} ${productInfo.merchPrice.currency}`;
    const excludedRegions = `${productInfo.merchProduct.commerceCountryExclusions}`
    const promoInclusions = productInfo.merchPrice.promoInclusions;
    const promoExclusions = productInfo.merchPrice.promoExclusions;
    const productQuantityLimit = productInfo.merchProduct.quantityLimit;
    const slug = publishedContent.properties.seo.slug;
    let productStatus = `${productInfo.merchProduct.status}`;
    let publishType = `${productInfo.merchProduct.publishType}`;
    let productDiscounted = productInfo.merchPrice.discounted;
    let customerServiceDiscount = `🍏`;
    let releaseDate;
    let happyBirthdayDiscount;
    let productPrice;
    let link;
    let time, day, month, year, hour, minutes;
    
    if(publishType == "LAUNCH") {
      link = `https://www.nike.com/${region.toLowerCase()}/launch/r/${sku}`;
      const launchMethod = productInfo.launchView.method;
      publishType = `LAUNCH (${launchMethod})`;
      releaseDate = productInfo.launchView.startEntryDate;
      time = new Date(releaseDate);
         day = time.getDate().toString().padStart(2, '0');
         month = (time.getMonth() + 1).toString().padStart(2, '0');
         year = time.getFullYear();
         hour = time.getHours().toString().padStart(2, '0');
         minutes = time.getMinutes().toString().padStart(2, '0');
    } else {
      link =`https://www.nike.com/${region.toLowerCase()}/t/${slug}/${sku}`;
      releaseDate = productInfo.merchProduct.commerceStartDate;
      time = new Date(releaseDate);
         day = time.getDate().toString().padStart(2, '0');
         month = (time.getMonth() + 1).toString().padStart(2, '0');
         year = time.getFullYear();
         hour = time.getHours().toString().padStart(2, '0');
         minutes = time.getMinutes().toString().padStart(2, '0');
    }

    if (productDiscounted === true) {
      productDiscounted = `🍏`;
      productPrice = `~~${productFullPrice}~~ (${productCurrentPrice})`
    } else {
      productPrice = `${productFullPrice}`
      productDiscounted = `🍓`
    }
    if (promoInclusions.length == 0 && promoExclusions.length == 0) {
      happyBirthdayDiscount = `🍏`
    } else {
      happyBirthdayDiscount = `🍓`
    }
    if(productStatus == "INACTIVE") {
      productStatus = `INACTIVE ⛔`
    } else if(productStatus == "CLOSEOUT") {
      productStatus = `CLOSEOUT ⛔`
    } else if(productStatus == "HOLD") {
      productStatus = `HOLD ⛔`
    } 
    else if (productStatus == "ACTIVE") {
      productStatus = `ACTIVE ✅`
    }
    
    
    const embed = new EmbedBuilder()
    .setTitle(`${countryEmoji} ${productName}\n`)
    .setURL(`${link}`)
    .setThumbnail(`${productImage.replace("images/", "images/t_PDP_1728_v1/")}`) //White backgorund for all products
    .setColor("#348feb")
    .setFooter({ text:"Icy's project", iconURL:"https://imgur.com/PBOj3cj" })
    .setTimestamp()
    embed.addFields({
      name: `\u2008`, value: `Status: **${productStatus}**\nSKU: **${productSku}**\nPrice: **${productPrice}** (**${productQuantityLimit}**) ([StockX](https://stockx.com/search?s=${sku}))\nMethod: **${publishType}**`
    })
    //Getting Sizes and Stock of the product
    embed.addFields({
      name: `Sizes and stock:`, value: "\u2008"
    })
    let sizePack = [];
    if(!productInfo.skus) {
      sizePack.push(`N/A`)
    } else {
      for(let i = 0; i < productInfo.skus.length; ++i) {
        if(!productInfo.availableSkus) { // In case there are no Sizes available 
          sizePack.push(`N/A`)
          i = productInfo.skus.length;
        } else {
          for(let j = 0; j < productInfo.availableSkus.length; ++j) {
            if (productInfo.skus[i].id == productInfo.availableSkus[j].id) {
            let stock = productInfo.availableSkus[j].level;
            if(stock == "OOS") {
              stock = `[🍓] - **${productInfo.availableSkus[j].level}**`
            } if(stock == "LOW") {
              stock = `[🍊] - **${productInfo.availableSkus[j].level}**`
            } if(stock == "MEDIUM") {
              stock = `[🍋] - **${productInfo.availableSkus[j].level}**`
            } if(stock == "HIGH") {
              stock = `[🍏] - **${productInfo.availableSkus[j].level}**`
            }
            if(region == "US"){
            sizePack.push(`${stock} - ${productInfo.skus[i].nikeSize} US\n`);
            } else {
              sizePack.push(`${stock} - ${productInfo.skus[i].nikeSize} US **(${productInfo.skus[i].countrySpecifications[0].localizedSize} ${productInfo.skus[i].countrySpecifications[0].localizedSizePrefix})**\n`);
            }
          }
        }
      }
      }
    }
    embed.addFields(
      { name: `\u2008`, value: `${sizePack.join("")}`, inline: true},
    )
   embed.addFields(
      { name: `\u2008`, value: `Available on: **${day}/${month}/${year} [${hour}:${minutes}]**\nExcluded countries: **${excludedRegions}**\nSale/HBD/CS: **${productDiscounted}/${happyBirthdayDiscount}/${customerServiceDiscount}**\nOther: [SNKRS](https://www.nike.com/${region.toLowerCase()}/launch/r/${sku})`},
    )
    await interaction.reply({embeds: [embed]})
  } catch (error) {
    console.error ("Error using command /nike:", error);
    throw error
  }
} else {
  interaction.reply(`Sku must have 10 charaters and region 2! Ex: SKU = FN8675-100 and REGION = RO`)
}}

async function executeGSLINKS(interaction) {
  const sku = interaction.options.get("sku").value.toUpperCase();
  const region = interaction.options.get("region").value.toLowerCase();
  const instance = axios.create ({proxy: proxy});
  if (sku.length == 10) {
  try {
    const link = `https://www.nike.com/${region}/launch/r/${sku}`;
    const sizes = [3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,14,15];
    const response = await instance.get(`https://api.nike.com/product_feed/threads/v3?filter=language(en-GB)&filter=marketplace(RO)&filter=channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647)&filter=productInfo.merchProduct.styleColor(${sku})`)
    const gsResponse = response.data;
    const productInfo = gsResponse.objects[0].productInfo[0];
    const productId = gsResponse.objects[0].productInfo[0].merchProduct.id;
    const productImage = gsResponse.objects[0].publishedContent.properties.productCard.properties.squarishURL;
    const productName = productInfo.productContent.fullTitle;
    const productSku = `${productInfo.merchProduct.styleColor}`;
    const productFullPrice = `${productInfo.merchPrice.fullPrice} ${productInfo.merchPrice.currency}`;
    const embed = new EmbedBuilder()
    .setTitle(`${productName} (${productSku})`)
    .setURL(`${link}`)
    .setThumbnail(`${productImage}`)
    .setColor("#348feb")
    .setTimestamp()
    .setFooter({ text:"Icy's project", iconURL:"https://imgur.com/gallery/Vr8QbLR" })
    .addFields({
      name: `Price: ${productFullPrice}`, value: "\u2008"
    })
    for(let i = 0; i < sizes.length; ++i) {
      embed.addFields(
        { 
            name: `${sizes[i]} - ${link}?size=${sizes[i]}&productId=${productId}`,
            value: "\u2008",
        }
      )
    }
    await interaction.reply({embeds: [embed]})
  } catch (error) {
    console.error ("Error using command /gslinks:", error);
    throw error
  }
  } else {
    interaction.reply(`SKU must have 10 letters!`)
  }
}
  async function executeEULINKS(interaction) {
    const sku = interaction.options.get("sku").value.toUpperCase();
    const region = interaction.options.get("region").value.toUpperCase();
    const marketplaceLanguage = availableCountries[region.toUpperCase()].language;
    const instance = axios.create ({proxy: proxy});
    if(sku.length == 10) {
      try {
      const response = await instance.get(`https://api.nike.com/product_feed/threads/v3?filter=language(${marketplaceLanguage})&filter=marketplace(${region})&filter=channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647)&filter=productInfo.merchProduct.styleColor(${sku})`)
      const nikeEuResponse = response.data;
      const productInfo = nikeEuResponse.objects[0].productInfo[0];
      const productId = nikeEuResponse.objects[0].productInfo[0].merchProduct.id;
      const slug = productInfo.productContent.slug;
      const sizes = [3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,14,15];
      const link = `https://www.nike.com/${region.toLowerCase()}/launch/t/${slug}`;
      const productImage = nikeEuResponse.objects[0].publishedContent.properties.productCard.properties.squarishURL;
      const productName = productInfo.productContent.fullTitle;
      const productSku = `${productInfo.merchProduct.styleColor}`;
      const productFullPrice = `${productInfo.merchPrice.fullPrice} ${productInfo.merchPrice.currency}`;
      const embed = new EmbedBuilder()
      .setTitle(`${productName} (${productSku})`)
      .setURL(`${link}`)
      .setThumbnail(`${productImage}`)
      .setColor("#348feb")
      .setTimestamp()
      .setFooter({ text:"Icy's project", iconURL:"https://imgur.com/gallery/Vr8QbLR" })
      .addFields({
        name: `Price: ${productFullPrice}`, value: "\u2008"
      })
      for(let i = 0; i < sizes.length; ++i) {
        embed.addFields(
          { 
              name: `${sizes[i]} - ${link}?size=${sizes[i]}&productId=${productId}`,
              value: "\u2008",
          }
        )
      }
      await interaction.reply({embeds: [embed]})
      } catch (error) {
        console.error ("Error using command /eulinks:", error)
        throw error;
      }
    } else {
      interaction.reply("SKU must have 10 letters!")
    }
}
  module.exports = { 
    executeNIKE,
    executeSNKRS,
    executeGSLINKS,
    executeEULINKS,
  }