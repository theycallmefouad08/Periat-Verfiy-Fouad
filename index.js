  const { Intents  , Client , MessageActionRow, MessagePayload  , MessageSelectMenu ,Modal , MessageEmbed  ,MessageButton , MessageAttachment, Permissions, TextInputComponent   } = require('discord.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

var express = require("express");
var app = express();
var path = require("path");
const fs = require("fs");
var bodyParser = require("body-parser");
const Database = require('st.db')
const db = new Database('coinsdb');
const usersdata = new Database({
  path: './database/users.json',
  databaseInObject: true
})
const DiscordStrategy = require('passport-discord').Strategy
  , refresh = require('passport-oauth2-refresh');
const passport = require('passport');
const session = require('express-session');
const wait = require('node:timers/promises').setTimeout;
const { channels, price,bot, website } = require("./config.js");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(__dirname + "assets"))
app.set("view engine", "ejs")
app.use(express.static("public"));
const config = require('./config.js');

const { use } = require("passport");
global.config = config;
import('node-fetch')
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

require('./slash.js')
app.get('/', function (req, res) {
  res.send('Hello World')
})
const prefix = config.bot.prefix; 
app.listen(config.website.PORT)
var scopes = ['identify', 'guilds', 'guilds.join'];

passport.use(new DiscordStrategy({
  clientID: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  callbackURL: config.bot.callbackURL,
  scope: scopes
}, async function (accessToken, refreshToken, profile, done) {
  process.nextTick(async function () {
    usersdata.set(`${profile.id}`, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      email: profile.email
    })
    return done(null, profile);
  });
  await oauth.addMember({
    guildId: `${config.bot.GuildId}`,
    userId: profile.id,
    accessToken: accessToken,
    botToken: client.token
  })
const channel = await client.channels.fetch(config.Log.LogChannelOwners); // استبدل بـ ID القناة التي تريد إرسال الرسالة إليها
  if (channel) {
    const embed = new MessageEmbed()
      .setColor('#7adfdb')
      .setTitle('🛬・Auth Successful')
      .setDescription(`☑️・You're Successful Auth, <@${profile.id}>`)
      .addField('#️⃣・Id User', profile.username, true)
      .addField('👤・User Username', profile.id, true)
      .setTimestamp();

    channel.send({ embeds: [embed] });
    channel.send({content: `${config.bot.LineIce}`})
  } else {
    console.error('القناة غير موجودة.');
  }

  return done(null, profile);
}));



app.get("/", function (req, res) {
  res.render("index", { client: client, user: req.user, config: config, bot: bot });
});



app.use(session({
  secret: 'some random secret',
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  saveUninitialized: false
}));
app.get("/", (req, res) => {
  res.render("index", { client: client, user: req.user, config: config, bot: bot });
});
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord', { failureRedirect: '/' }), function (req, res) {
  var characters = '0123456789';
  let idt = ``
  for (let i = 0; i < 20; i++) {
    idt += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  res.render("login", { client: client, user: req.user.username, config: config, bot: bot });
});




client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `send`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    
    let button = new MessageButton()
      .setLabel('💰・Claim Nitro')
      .setStyle('LINK')
      .setURL(`${config.bot.TheLinkVerfy}`)


    let row = new MessageActionRow()
      .setComponents(button)

    // إرسال الرسالة مع الـ Embed والأزرار
    message.channel.send({ components: [row] });
  }
});

let coinsData;


// تحميل أو إنشاء قاعدة بيانات العملات
function loadCoinsData() {
    if (fs.existsSync('./coinsdb.json')) {
        coinsData = JSON.parse(fs.readFileSync('./coinsdb.json', 'utf8'));
    } else {
        coinsData = [];
    }
}
// حفظ التغييرات إلى قاعدة البيانات
function saveCoinsData() {
    fs.writeFileSync('./coinsdb.json', JSON.stringify(coinsData, null, 4));
}

// الحصول على عدد الكوينز للمستخدم
function getCoins(userId) {
    const entry = coinsData.find(([key]) => key === `coins_${userId}`);
    return entry ? entry[1] : 0;
}

// تحديث عدد الكوينز للمستخدم
function setCoins(userId, amount) {
    const index = coinsData.findIndex(([key]) => key === `coins_${userId}`);
    if (index !== -1) {
        coinsData[index][1] = amount;
    } else {
        coinsData.push([`coins_${userId}`, amount]);
    }
    saveCoinsData();
}

client.once('ready', () => {
    console.log('Bots By Alz3eam Developer');
    loadCoinsData();
    
    client.user.setStatus('streaming');

    const activities = [
        ', Periat.Fouad ❥ Develop All Bots'
    ];

    setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setPresence({
            'activities': [{ 'name': randomActivity }],
            'status': 'streaming'
        });
    }, 7500);
});
// إدارة العمليات النشطة
// إدارة العمليات النشطة
const activePurchases = new Map();

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith(prefix + 'buy-coins')) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    args.shift();

    const amount = parseInt(args[0]); // الكمية المطلوبة من الكوينز

    if (isNaN(amount) || amount <= 0) {
      console.log(`❌ | المستخدم ${message.author.username} لم يحدد كمية صالحة.`);
      return message.channel.send(`**❌ | يرجى كتابة الكمية التي تريد شرائها \`${prefix}buy-coins [amount]\` **`);
    }

    // تحقق إذا كان المستخدم لديه عملية جارية
    if (activePurchases.has(message.author.id)) {
      console.log(`❌ | المستخدم ${message.author.username} لديه عملية شراء جارية بالفعل.`);
      return message.channel.send(`**❌ | لديك عملية شراء جارية بالفعل. يرجى إتمام العملية الحالية أولاً أو إلغائها.**`);
    }

    const pricePerCoin = config.bot.coinprice; // السعر لكل كوين
    const totalPriceWithoutTax = amount * pricePerCoin; // السعر الإجمالي بدون الضريبة
    const taxAmount = Math.floor(totalPriceWithoutTax * (20 / 19) + 1); // حساب الضريبة
    const finalAmount = taxAmount; // المبلغ النهائي مع الضريبة

    console.log(`المستخدم ${message.author.username} طلب شراء ${amount} كوينز. السعر الإجمالي مع الضريبة: ${finalAmount}`);

    // إضافة العملية الجارية
    activePurchases.set(message.author.id, { amount, finalAmount });

    // إعداد زر "إلغاء" للمستخدم
    const cancelButton = new MessageButton()
      .setCustomId('cancel_purchase')
      .setLabel('إلغاء العملية')
      .setStyle('DANGER');

    const buytembed = new MessageEmbed()
      .setDescription(`
\`\`\`#credit ${config.bot.TraId} ${taxAmount}\`\`\` 
`)

    const row = new MessageActionRow().addComponents(cancelButton);

    try {
      await message.channel.send({
        content: `**مرحبا ${message.author} 👋 **\n\n** لشراء \`${amount}\` كوينز 🪙 يجب عليك تحويل المبلغ 👇**
**الرجاء التحويل في غضون 5 دقائق ! ↪️ **`,
        components: [row],
        embeds: [buytembed],
      });
      console.log(`✅ | تم إرسال رسالة الشراء بنجاح للمستخدم ${message.author.username}.`);
    } catch (error) {
      console.error(`❌ | حدث خطأ عند إرسال رسالة الشراء للمستخدم ${message.author.username}: ${error.message}`);
      return message.channel.send(`**❌ | حدث خطأ أثناء إرسال رسالة الشراء. يرجى المحاولة لاحقًا.**`);
    }

    const filter = ({ content, author: { id } }) => {
      return (
        content.startsWith(`**:moneybag: | ${message.author.username}, has transferred `) &&
        content.includes(config.bot.TraId) &&
        id === '282859044593598464'
      );
    };

    const collector = message.channel.createMessageCollector({
      filter,
      max: 1,
      time: 300000, // 5 دقائق للتحويل
    });

    collector.on('collect', async collected => {
      try {
        // استخراج المبلغ المحول
        const transferAmount = Number(collected.content.match(/\$([0-9]+)/)[1]);
        console.log(`تم استلام التحويل: ${transferAmount} كريدت من ${message.author.username}`);

        // التحقق من المبلغ المحول (يجب أن يتضمن الضريبة)
        if (transferAmount === config.bot.coinprice *amount) {
          console.log(`✅ | المبلغ المحول من ${message.author.username} صحيح.`);
          
          // إضافة الكوينز
          try {
            await db.add(`coins_${message.author.id}`, amount); // إضافة الكوينز
            console.log(`✅ | تم إضافة ${amount} كوينز لحساب المستخدم ${message.author.username}.`);

            // إرسال رسالة للمستخدم
            await message.channel.send(`**✅ | ${message.author} تم تنفيذ العملية بنجاح! لقد تم إضافة \`${amount}\` كوينز إلى حسابك.**`);

            // تسجيل العملية في اللوق
            const logChannel = message.guild.channels.cache.get(config.bot.logChannelId);
            if (logChannel) {
              logChannel.send(`**📥 | ${message.author.username} قام بشراء \`${amount}\` كوينز بنجاح!**`);
            }
          } catch (error) {
            console.error(`❌ | حدث خطأ عند إضافة الكوينز لحساب ${message.author.username}: ${error.message}`);
            return message.channel.send(`**❌ | حدث خطأ أثناء إضافة الكوينز لحسابك. يرجى المحاولة لاحقًا.**`);
          }
        } else {
          console.log(`❌ | المبلغ المحول من ${message.author.username} غير مطابق للسعر المطلوب.`);
          await message.channel.send('**❌ | المبلغ المحول غير مطابق للسعر المطلوب.**');
        }
      } catch (error) {
        console.error(`❌ | حدث خطأ أثناء معالجة التحويل من ${message.author.username}: ${error.message}`);
        await message.channel.send('**❌ | حدث خطأ أثناء معالجة التحويل. يرجى المحاولة لاحقًا.**');
      }

      // إزالة العملية الجارية بعد إتمام التحويل
      activePurchases.delete(message.author.id);
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        console.log(`❌ | المستخدم ${message.author.username} لم يقم بالتحويل في الوقت المحدد.`);
        message.channel.send(`**❌ | ${message.author} لقد انتهى الوقت، لا تقم بالتحويل الآن.**`);
      }

      // إزالة العملية الجارية في حال انتهى الوقت
      activePurchases.delete(message.author.id);
    });

    // التعامل مع زر "إلغاء العملية"
    const buttonFilter = (interaction) => interaction.user.id === message.author.id && interaction.isButton();
    const buttonCollector = message.channel.createMessageComponentCollector({
      filter: buttonFilter,
      time: 300000, // 5 دقائق
    });

    buttonCollector.on('collect', async (interaction) => {
      if (interaction.customId === 'cancel_purchase') {
        // إزالة العملية الجارية
        activePurchases.delete(message.author.id);

        // إرسال رسالة تأكيد بالإلغاء
        await interaction.update({
          content: `**تم إلغاء العملية، يمكنك الآن بدء عملية شراء جديدة.**`,
          components: [], // إزالة الأزرار بعد الإلغاء
        });
      }
    });
  }
});












client.on('messageCreate', (message) => {
    if (!message.content.startsWith(config.bot.prefix) || message.author.bot) return;

    const args = message.content.slice(config.bot.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // أمر عرض الكوينز
    if (command === 'coins') {
        let target = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
        const coins = getCoins(target.id);

        message.channel.send(`🪙 | **${target.username}** رصيد حسابه : \`${coins}\``);
    }

    // أمر إعطاء الكوينز
    if (command === 'give') {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

        let target = message.mentions.users.first() || client.users.cache.get(args[0]);
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount <= 0) {
            return message.reply("Usage: `!give [mention/id] [amount]`");
        }

        const currentCoins = getCoins(target.id);
        setCoins(target.id, currentCoins + amount);

        message.channel.send(`** :white_check_mark:  | تم إعطاء ${amount} لـ <@${target.id}>**`);
    }

    // أمر إزالة الكوينز
    if (command === 'take') {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

        let target = message.mentions.users.first() || client.users.cache.get(args[0]);
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount) || amount <= 0) {
            return message.reply("Usage: `!take [mention/id] [amount]`");
        }

        const currentCoins = getCoins(target.id);
        setCoins(target.id, Math.max(currentCoins - amount, 0));

        message.channel.send(`** :white_check_mark:  | تم إزالة ${amount} من <@${target.id}>**`);
    }
});














client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `invite`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let button = new MessageButton()
      .setLabel(`・Invite Me To Your Server`)
      .setStyle(`LINK`)
      .setURL(config.bot.inviteBotUrl)
      .setEmoji(`🔗`)

    let row = new MessageActionRow()
      .setComponents(button)
    message.channel.send({ components: [row] })
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `check`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let args = message.content.split(" ").slice(1).join(" ");
    if (!args) return message.channel.send({ content: `**منشن شخص طيب**` });
    let member = message.mentions.members.first() || message.guild.members.cache.get(args.split(` `)[0]);
    if (!member) return message.channel.send({ content: `**شخص غلط**` });
    let data = usersdata.get(`${member.id}`)
    if (data) return message.channel.send({ content: `**موثق بالفعل**` });
    if (!data) return message.channel.send({ content: `**غير موثق**` });
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `join`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let msg = await message.channel.send({ content: `**جاري الفحص ..**` })
    let alld = usersdata.all()
    let args = message.content.split(` `).slice(1)
    if (!args[0] || !args[1]) return msg.edit({ content: `**عذرًا , يرجى تحديد خادم ..**` }).catch(() => { message.channel.send({ content: `**عذرًا , يرجى تحديد خادم ..**` }) });
    let guild = client.guilds.cache.get(`${args[0]}`)
    let amount = args[1]
    let count = 0
    if (!guild) return msg.edit({ content: `**عذرًا , لم اتمكن من العثور على الخادم ..**` }).catch(() => { message.channel.send({ content: `**عذرًا , لم اتمكن من العثور على الخادم ..**` }) });
    if (amount > alld.length) return msg.edit({ content: `**لا يمكنك ادخال هاذا العدد ..**` }).catch(() => { message.channel.send({ content: `**لا يمكنك ادخال هاذا العدد ..**` }) });;
    for (let index = 0; index < amount; index++) {
      await oauth.addMember({
        guildId: guild.id,
        userId: alld[index].ID,
        accessToken: alld[index].data.accessToken,
        botToken: client.token
      }).then(() => {
        count++
      }).catch(() => { })
    }
    msg.edit({
      content: `**تم بنجاح ..**
**تم ادخال** \`${count}\`
**لم اتمكن من ادخال** \`${amount - count}\`
**تم طلب** \`${amount}\``
    }).catch(() => {
      message.channel.send({
        content: `**تم بنجاح ..**
**تم ادخال** \`${count}\`
**لم اتمكن من ادخال** \`${amount - count}\`
**تم طلب** \`${amount}\``
      })
    });;
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `refresh`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let mm = await message.channel.send({ content: `**جاري عمل ريفريش ..**` }).catch(() => { })
    let alld = usersdata.all()
    var count = 0;

    for (let i = 0; i < alld.length; i++) {
      await oauth.tokenRequest({
        'clientId': client.user.id,
        'clientSecret': config.bot.clientSECRET,
        'grantType': 'refresh_token',
        'refreshToken': alld[i].data.refreshToken
      }).then((res) => {
        usersdata.set(`${alld[i].ID}`, {
          accessToken: res.access_token,
          refreshToken: res.refresh_token
        })
        count++
      }).catch(() => {
        usersdata.delete(`${alld[i].ID}`)
      })
    }

    mm.edit({
      content: `**تم بنجاح ..**
**تم تغير** \`${count}\`
**تم حذف** \`${alld.length - count}\``
    }).catch(() => {
      message.channel.send({ content: `**تم بنجاح .. ${count}**` }).catch(() => { })
    })
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'stock')) {
    // التأكد من أن المستخدم لديه الصلاحية لتنفيذ الأمر
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    const guildIcon = message.guild.iconURL(); // صورة الخادم
    const botName = client.user.username; // اسم البوت
    const botAvatar = client.user.displayAvatarURL(); // صورة البوت

    // جلب بيانات المستخدمين
    let alld = usersdata.all();

    // إنشاء الـ Embed
    const embed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('👥・كمية الأعضاء المتوفرة حاليا')
      .setDescription(`**👥・متوفر حاليا  ${alld.length} عضو.**`)
      .setImage('https://media.discordapp.net/attachments/1382390409950531654/1405290232160587786/info_.png?ex=689e4a04&is=689cf884&hm=6b3582ee0ee2f94458d469888cea37e6cba8ce22504a60de43c0a2c49ac25bc7&=&format=webp&quality=lossless&width=752&height=473')
      .setThumbnail(guildIcon) // تعيين صورة الخادم
      .setTimestamp()
      .setFooter({ text: botName, iconURL: botAvatar });

    // إنشاء زر Refresh
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('refresh_users')
        .setEmoji('🔄')
        .setStyle('SECONDARY')
    );

    // إرسال رسالة الـ Embed مع الزر إلى القناة
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// الاستماع للتفاعل مع الزر (Interaction)
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  // التحقق من زر الـ Refresh
  if (interaction.customId === 'refresh_users') {
      
    const guildIcon = interaction.guild.iconURL(); // صورة الخادم
    const botName = client.user.username; // اسم البوت
    const botAvatar = client.user.displayAvatarURL(); 
    // جلب بيانات المستخدمين
    let alld = usersdata.all();

    // تحديث الـ Embed
    const updatedEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('👥・كمية الأعضاء المتوفرة حاليا')
      .setDescription(`**👥・متوفر حاليا  ${alld.length} عضو.**.`)
      .setImage('https://media.discordapp.net/attachments/1382390409950531654/1405290232160587786/info_.png?ex=689e4a04&is=689cf884&hm=6b3582ee0ee2f94458d469888cea37e6cba8ce22504a60de43c0a2c49ac25bc7&=&format=webp&quality=lossless&width=752&height=473')
      .setThumbnail(guildIcon) // تعيين صورة الخادم
      .setTimestamp()
      .setFooter({ text: botName, iconURL: botAvatar });

    // تحديث الرسالة الأصلية بالـ Embed الجديد
    await interaction.update({ embeds: [updatedEmbed], components: interaction.message.components });
  }
});




client.on('messageCreate', async (message) => {
  // تحقق من أن الرسالة ليست من البوت
  if (message.author.bot) return;

  // تغيير اسم البوت
  if (message.content.startsWith(`${prefix}setname`)) {
      
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    const newName = message.content.split(' ').slice(1).join(' ');
    if (!newName) return message.reply('يرجى تقديم اسم جديد للبوت.');

    try {
      await client.user.setUsername(newName);
      message.channel.send(`تم تغيير اسم البوت إلى: ${newName}`);
    } catch (error) {
      console.error(error);
      message.channel.send('حدث خطأ أثناء محاولة تغيير اسم البوت.');
    }
  }

  // تغيير صورة البوت
  if (message.content.startsWith(`${prefix}setavatar`)) {
      
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    const newAvatarUrl = message.content.split(' ')[1];
    if (!newAvatarUrl) return message.reply('يرجى تقديم رابط صورة جديد للبوت.');

    try {
      await client.user.setAvatar(newAvatarUrl);
      message.channel.send('تم تغيير صورة البوت بنجاح.');
    } catch (error) {
      console.error(error);
      message.channel.send('حدث خطأ أثناء محاولة تغيير صورة البوت.');
    }
  }
});




client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + 'help')) {
    // التحقق من أن المستخدم لديه الصلاحية للوصول إلى هذه القائمة
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    // إنشاء Embed لقائمة المساعدة العامة
    const generalEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('📋・General - قائمة المساعدة')
      .setDescription(`
**🔁・[\`${prefix}stock\`]** - عرض مخزون اعضاء 
**ℹ️・[\`${prefix}help\`]** - عرض قائمة المساعدة
**🔗・[\`${prefix}invite\`]** - دعوة البوت
**📜・[\`${prefix}tax\`]** - حساب ضريبة بروبوت

`)
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    // إنشاء الأزرار
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('general')
        .setLabel('👥・General')
        .setStyle('SECONDARY'),
      
      new MessageButton()
        .setCustomId('owners')
        .setLabel('👑・Owners')
        .setStyle('SECONDARY'),

      new MessageButton()
        .setLabel('🔗・Invite Bot')
        .setStyle('LINK')
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.ClientId}&permissions=8&scope=bot`)
    );

    // إرسال الرسالة مع الـ Embed والأزرار
    await message.reply({ embeds: [generalEmbed], components: [row] });
  }
});

// الاستماع للتفاعل مع الأزرار (Interaction)
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  // التعامل مع زر General
  if (interaction.customId === 'general') {
    const generalEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('📋 قائمة المساعدة - General')
      .setDescription(`**🔁・[\`${prefix}stock\`]** - عرض عدد المستخدمين
        **ℹ️・[\`${prefix}help\`]** - عرض قائمة المساعدة
        **🔗・[\`${prefix}invite\`]** - دعوة البوت
        **📜・[\`${prefix}tax\`]** - حساب ضريبة بروبوت
        **🪙・[\`${prefix}coins\`]** - لعرض رصيدك او رصيد شخص اخر
`)
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    await interaction.update({ embeds: [generalEmbed], components: interaction.message.components });
  }

  // التعامل مع زر Owners
  if (interaction.customId === 'owners') {
    if (!config.bot.owners.includes(`${interaction.user.id}`)) {
      // رد مخفي يظهر أن المستخدم ليس لديه الصلاحية
      return interaction.reply({ content: '❌ ليس لديك صلاحية الوصول إلى قائمة الأوامر هذه.', ephemeral: true });
    }

    const ownersEmbed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setTitle('🔑 قائمة المساعدة - Owners')
      .setDescription(`

        **➕・[\`${prefix}join {ServerId} {amount}\`]** - الانضمام إلى سيرفر
        **🔁・[\`${prefix}refresh\`]** - تحديث المعلومات
        **☑️・[\`${prefix}check\`]** - التحقق من حالة معينة
        **📨・[\`${prefix}send\`]** - إرسال رسالة
        **💳・[\`${prefix}price\`]** - وضع سعر اعضاء بلكريديت
       **🪙・[\`${prefix}coinprice\`]** - وضع سعر أعضاء بلكوينز
        **➖・[\`${prefix}give\`]** - لإعطاء رصيد لشخص
        **➕・[\`${prefix}take\`]** - لإزالة رصيد من شخص
`)
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    await interaction.update({ embeds: [ownersEmbed], components: interaction.message.components });
  }
});
var listeners = app.listen(`${config.website.PORT}`, function () {
  console.log("Your app is listening on port " + `${config.website.PORT}`)
});

client.on('ready', () => {
  console.log(`Periat Verfiy Is On! ${client.user.tag}`);
});
// Login with proper error handling
client.login(config.bot.TOKEN).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});

const { AutoKill } = require('autokill')
AutoKill({ Client: client, Time: 5000 })

process.on("uncaughtException" , error => {
return;
})
process.on("unhandledRejection" , error => {
return;
})
process.on("rejectionHandled", error => {
return;
});







client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  console.log('تم استدعاء الأمر');

  if (interaction.commandName === 'setup') {
      
    if (!config.bot.owners.includes(`${interaction.user.id}`)) {  // تم تعديل interaction.author.id إلى interaction.user.id
      return;
    }
    console.log('الأمر setup تم استدعاؤه');

    const Channel = interaction.channel;

    const embed = new MessageEmbed()
      .setAuthor({ name: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
      .setTitle('خدمة بيع أعضاء حقيقية')
      .setDescription('* لشراء أعضاء يرجى فتح تذكرة')
      .setColor(config.bot.colorembed)
      .setImage('https://media.discordapp.net/attachments/1405300946292052031/1405352981309952123/info_2.png?ex=689e8474&is=689d32f4&hm=89ed963523939a642fc7320b6f3653cf1f0a2f276eebfc656db932c0da269d9a&=&format=webp&quality=lossless')
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp()
      .setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('openticket')
        .setLabel('شراء اعضاء・')
        .setEmoji('👥')
        .setStyle('SECONDARY'),
      new MessageButton()
      .setCustomId('GetIdServer')
      .setLabel('أيدي سيرفر・')
      .setEmoji('🔍')
      .setStyle('SECONDARY')
    );

    try {
      await Channel.send({ embeds: [embed], components: [row] });
      console.log('تم إرسال الرسالة بنجاح');
    } catch (error) {
      console.error('حدث خطأ أثناء إرسال الرسالة:', error);
    }

    await interaction.reply({ content: '**تم إرسال بانل الشراء بنجاح ✅**', ephemeral: true });
  }
});



client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'GetIdServer') {
      // إنشاء المودال
      const modal = new Modal()
        .setCustomId('ServerLinkModal')
        .setTitle('أدخل رابط سيرفرك')
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('serverLink')
              .setLabel('أدخل رابط السيرفرك')
              .setStyle('SHORT')
              .setPlaceholder('https://discord.gg/example')
              .setRequired(true)
          )
        );

      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'ServerLinkModal') {
      const serverLink = interaction.fields.getTextInputValue('serverLink');
      const inviteCode = serverLink.split('/').pop();

      try {
        const invite = await client.fetchInvite(inviteCode);
        const guild = invite.guild;

        if (guild) {
          return interaction.reply({
            content: `تم استخراج بيانات السيرفر بنجاح:\n**ID:** ${guild.id}\n**Guild Name:** ${guild.name}`,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error('Error fetching invite:', error);

        const inviteButton = new MessageButton()
          .setStyle('LINK')
          .setLabel('إضافة البوت')
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.botID}&permissions=8&scope=bot`);

        const actionRow = new MessageActionRow().addComponents(inviteButton);

        return interaction.reply({
          content: 'عذرًا، لم أتمكن من العثور على هذا السيرفر. يُرجى إضافة البوت إلى السيرفر المطلوب باستخدام الرابط أدناه.',
          components: [actionRow],
          ephemeral: true,
        });
      }
    }
  }
});




client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'openticket') {
    // رسالة مخفية تسأل المستخدم عن طريقة الدفع
    const paymentRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('payCredit')
        .setLabel('Credit')
        .setEmoji('<a:ProBot:1301675209073627156>')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('payCoins')
        .setLabel('Coins')
        .setEmoji('🪙')
        .setStyle('SECONDARY')
    );

    await interaction.reply({
      content: 'Please Select Payment Method :',
      components: [paymentRow],
      ephemeral: true,
    });
  }

  if (interaction.customId === 'payCredit') {
    // التحقق من أن الفئة (Category) موجودة
    const category = await interaction.guild.channels.cache.get(config.bot.ceatogry);
    if (!category || category.type !== 'GUILD_CATEGORY') {
      return interaction.reply({ content: 'لم يتم العثور على الفئة المحددة.', ephemeral: true });
    }

    const channelSpin = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
      type: 'GUILD_TEXT',
      parent: config.bot.ceatogry, // الفئة المحددة
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: ['VIEW_CHANNEL'],
        },
        {
          id: interaction.user.id,
          allow: ['VIEW_CHANNEL'],
        },
      ],
    });

    const ticketEmbed = new MessageEmbed()
      .setTitle('تــذكـرة شــراء أعــضــاء حقــيـفـية')
      .setDescription(`* **${interaction.user} مرحبا بك 👋**\n\n
  **هذه تذكرة شراء الخاصة بك سأوضح لك كيف تشتري**\n\n
  * 1. أولا يجب عليك إضافة البوت من زر \`إضافة البوت\` أسفله \n
  * 2. ثانيا اذهب إلى إعدادات حسابك في خيار \`Advance\` قم بتفعيل \`Developer Mode\` \n
  * 3. قم بنسخ إيدي سيرفرك ثم عد إلى التذكرة و اضغط زر \`شراء أعضاء\` في خانة أولى أدخل الكمية و في خانة ثانية أدخل إيدي سيرفر\n
  ثم اضغط \`Submit\`.\n
  سيقوم البوت بإرسال رسالة لكي تنسخ أمر التحويل وتقوم بالتحويل.\n
  ثم بعد ذلك سيقوم البوت بنظام تلقائي في إدخال الأعضاء إلى خادمك.\n\n
  * **⚠️ ملاحظات مهمة:**\n
  \`-\` يرجى العلم أن التحويل خارج التذكرة يعتبر خطأ ولن يتم تعويضك.\n
  \`-\` التحويل لشخص آخر خطأ منك وأنت تتحمل المسؤولية وليس لنا أي علاقة بك.\n
  \`-\` إذا قمت بالتحويل قبل أن تقوم بإضافة البوت فليس لنا علاقة بك.\n\n
عند انتهائك من الخدمة لا تنسى تقييمنا
فنحن دائمًا نقدم الأفضل 🫡`)
      .setImage('https://media.discordapp.net/attachments/1405300946292052031/1405352981309952123/info_2.png?ex=689e8474&is=689d32f4&hm=89ed963523939a642fc7320b6f3653cf1f0a2f276eebfc656db932c0da269d9a&=&format=webp&quality=lossless');

    const ticketRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('buyMembers')
        .setLabel('شراء أعضاء') 
        .setEmoji('<:members:1300180300449583205>')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setLabel('إدخال البـوت')
        .setStyle('LINK')
        .setEmoji('🔗')
        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${config.bot.ClientId}&permissions=8&scope=bot`),
      new MessageButton()
        .setCustomId('closeTicket')
        .setLabel('إغلاق التذكرة')
        .setEmoji('<:delete:1266691692371640320>')
        .setStyle('SECONDARY')
    );

    // إرسال الرسالة في القناة الجديدة
    await channelSpin.send({
      content: `* ${interaction.user}`,
      embeds: [ticketEmbed],
      components: [ticketRow],
    });

    // تأكيد إنشاء التذكرة
    await interaction.update({ content: `** تم إنشاء تذكرتك بنجاح : ${channelSpin} ✅ **`, components: [], ephemeral: true });
  }

  
});

// ================================================================


client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'payCoins') {
            const modal = new Modal()
                .setCustomId('confirmPay')
                .setTitle('شـراء أعضاء حقيقية');

            const countInput = new TextInputComponent()
                .setCustomId('amount2')
                .setLabel("الكمية")
                .setMinLength(1)
                .setMaxLength(5)
                .setStyle('SHORT');

            const serverIdInput = new TextInputComponent()
                .setCustomId('serverid2')
                .setLabel("ايدي سيرفرك")
                .setMinLength(1)
                .setMaxLength(22)
                .setStyle('SHORT');

            const actionRow1 = new MessageActionRow().addComponents(countInput);
            const actionRow2 = new MessageActionRow().addComponents(serverIdInput);
            modal.addComponents(actionRow1, actionRow2);

            await interaction.showModal(modal);
        }
    }

    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'confirmPay') {
        const count = parseInt(interaction.fields.getTextInputValue('amount2')); // عدد الأعضاء
        const serverId = interaction.fields.getTextInputValue('serverid2'); // معرف السيرفر
        const pricePerMember = config.bot.coinprice; // سعر كل عضو
        const userId = interaction.user.id; // معرف المستخدم
        const userBalance = getCoins(userId); // جلب رصيد المستخدم
        const totalCost = count * pricePerMember; // التكلفة الإجمالية
        let alld = usersdata.all();

        if (isNaN(count) || count <= 0) {
            return interaction.reply({ content: 'يرجى إدخال كمية صالحة.', ephemeral: true });
        }

        if (!serverId) {
            return interaction.reply({ content: 'يرجى إدخال معرف السيرفر.', ephemeral: true });
        }

        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            return interaction.reply({
                content: `لم يتم العثور على السيرفر. إذا لم يتم إضافة البوت، يمكنك إضافته من هذا الرابط:\n${config.bot.inviteBotUrl}`,
                ephemeral: true
            });
        }
        if (count > alld.length) {
            return interaction.reply({ content: `**هذا العدد لايوجد في المخزون ..**`, ephemeral: true });
        }

        if (userBalance < totalCost) {
            return interaction.reply({
                content: `**:x:, رصيدك الحالي غير كافي : ${userBalance}
رصيد المطلوب : ${totalCost} **`,
                ephemeral: true
            });
        }

        // رسالة تأكيد
        const confirmRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('confirmStart')
                .setLabel('تأكيد العملية')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('cancelStart')
                .setLabel('إلغاء العملية')
                .setStyle('DANGER')
        );

        await interaction.reply({
            content: `** هل أنت متأكد من إدخال : ${count} \nعلما أن سعر العضو واحد هو : ${config.bot.coinprice}**`,
            components: [confirmRow],
            ephemeral: true
        });

        // انتظر تفاعل المستخدم مع أزرار التأكيد أو الإلغاء
        const filter = (btnInteraction) =>
            btnInteraction.user.id === userId &&
            (btnInteraction.customId === 'confirmStart' || btnInteraction.customId === 'cancelStart');

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'cancelStart') {
                await btnInteraction.update({
                    content: '❌ **تم إلغاء العملية.**',
                    components: []
                });
                collector.stop();
                return;
            }

            if (btnInteraction.customId === 'confirmStart') {
const message = await btnInteraction.update({
                    content: '🔄 جاري إدخال الأعضاء، يرجى الانتظار...',
                    components: []
                });
                // خصم الرصيد
                setCoins(userId, userBalance - totalCost);

                // متغيرات لتعقب العملية
                let membersAdded = 0;
                let failedCount = 0;

                // تحديث الرسالة إلى "جاري إدخال الأعضاء"
                

                // إدخال الأعضاء
                for (let index = 0; index < count; index++) {
                    try {
                        await oauth.addMember({
                            guildId: guild.id,
                            userId: alld[index].ID, // بيانات الأعضاء
                            accessToken: alld[index].data.accessToken,
                            botToken: client.token
                        });
                        membersAdded++;
                    } catch (err) {
                        failedCount++;
                        console.error(`فشل إدخال العضو رقم ${index + 1}: ${err}`);
                    }
                }
 
                 await interaction.followUp({
                    content: `**✅ تمت العملية بنجاح!**\n**الأعضاء الذين تم إدخالهم:** \`${membersAdded}\`.\n**الأعضاء الذين فشلوا:** \`${failedCount}\`.\n**التكلفة الإجمالية:** \`${totalCost}\` كوين.`,
                ephemeral: true
                });

                // تعويض المستخدم إذا كان هناك فشل
                if (failedCount > 0) {
                    const refundAmount = failedCount * pricePerMember;
                    setCoins(userId, getCoins(userId) + refundAmount);

                    try {
                        await interaction.user.send({
                            content: `**تعويض عن الأعضاء الذين لم يتم إدخالهم:**\n❌ **عدد الأعضاء الفاشلين:** \`${failedCount}\`.\n💰 **تمت إضافة**: \`${refundAmount}\` عملة إلى رصيدك.`
                        });
                    } catch (err) {
                        console.error(`فشل إرسال رسالة خاصة للمستخدم: ${err}`);
                    }
                }
                        collector.stop();
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: '⌛ **انتهى وقت التأكيد. لم يتم تنفيذ العملية.**',
                    components: []
                });
            }
        });
    }
});





// ================================================================
client.on(`interactionCreate`,async interaction => {
  if (!interaction.isButton())return ; 
  if (interaction.customId == 'buyMembers'){

    const BuyModal = new Modal()
    .setCustomId('BuyModal')
    .setTitle('شراء اعضاء');
  const Count = new TextInputComponent()
    .setCustomId('Count')
    .setLabel("الكمية")
    .setMinLength(1)
    .setMaxLength(5)
    .setStyle('SHORT'); 
    
    const serverid = new TextInputComponent()
    .setCustomId('serverid')
    .setLabel("ايدي سيرفرك")
    .setMinLength(1)
    .setMaxLength(22)
    .setStyle('SHORT'); 


  const firstActionRow = new MessageActionRow().addComponents(Count);
  const firstActionRow2 = new MessageActionRow().addComponents(serverid);


  BuyModal.addComponents(firstActionRow , firstActionRow2);

  await interaction.showModal(BuyModal);


  } else if (interaction.customId === 'closeTicket') {
      const confirmRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('confirmDelete')
          .setLabel('تأكيد')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('cancelDelete')
          .setLabel('إلغاء')
          .setStyle('DANGER'),
      );

      await interaction.reply({
        content: 'هل أنت متأكد من إغلاق التذكرة؟',
        components: [confirmRow],
        ephemeral: true,
      });

    } else if (interaction.customId === 'confirmDelete') {
      await interaction.update({ content: '**سيتم حذف التذكرة بعد 5 ثواني...**', components: [] });

      setTimeout(async () => {
        const channel = interaction.channel;
        if (channel) await channel.delete();
      }, 5000);

    } else if (interaction.customId === 'cancelDelete') {
      await interaction.update({ content: '** تم إلغاء حذف التذكرة بنجاح **', components: [] });
    }
})




client.on(`interactionCreate`, async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId == 'BuyModal') {
    const Count = interaction.fields.getTextInputValue('Count');
    const serverid = interaction.fields.getTextInputValue('serverid');
    const price = config.bot.price;

    const result = Count * price;
    const tax = Math.floor(result * (20 / 19) + 1);

    let alld = usersdata.all();
    let guild = client.guilds.cache.get(`${serverid}`);
    let amount = Count;
    let count = 0;

    if (!guild) {
      return interaction.reply({ content: `**عذرًا , لم اتمكن من العثور على الخادم ..**` });
    }

    if (amount > alld.length) {
      return interaction.reply({ content: `**لا يمكنك ادخال هذا العدد ..**` });
    }

    await interaction.reply({ content: `#credit ${config.bot.TraId} ${tax}` });

    const filter = ({ content, author: { id } }) => {
      return (
        content.startsWith(`**:moneybag: | ${interaction.user.username}, has transferred `) &&
        content.includes(config.bot.TraId) &&
        id === "282859044593598464" &&
        (Number(content.slice(content.lastIndexOf("`") - String(tax).length, content.lastIndexOf("`"))) >= result)
      );
    };

    const collector = interaction.channel.createMessageCollector({
      filter,
      max: 1,
    });

    collector.on('collect', async collected => {
      console.log(`Collected message: ${collected.content}`);
      await interaction.deleteReply();

      let msg = await interaction.channel.send({ content: `**جاري الفحص ..**` });

      for (let index = 0; index < amount; index++) {
        await oauth.addMember({
          guildId: guild.id,
          userId: alld[index].ID,
          accessToken: alld[index].data.accessToken,
          botToken: client.token
        }).then(() => {
          count++;
        }).catch(err => {
          console.error(`Error adding member: ${err}`);
        });
      }

      msg.edit({
        content: `**تم بنجاح ..**
  **✅  تم ادخال** \`${count}\`
  **❌ لم اتمكن من ادخال** \`${amount - count}\`
  **📡 تم طلب** \`${amount}\``
      });
        
      // إرسال رسالة إلى القناة المحددة
      const channelId = config.bot.channelId; 
      const logChannel = client.channels.cache.get(channelId);

      const embed = new MessageEmbed()
        .setTitle('تم شراء أعضاء')
        .setDescription(`**العميل:** ${interaction.user}\n**عدد الأعضاء:** ${amount}`)
        .setColor(config.bot.colorembed)
        .setTimestamp();

      if (logChannel) {
        logChannel.send({ embeds: [embed] });
        logChannel.send({content:`${config.bot.LineIce}`})
      } else {
        console.log(`القناة بمعرف ${channelId} غير موجودة.`);
      }

      // إعطاء العميل رتبة معينة
      const roleId = config.bot.roleId; 
      const member = await guild.members.fetch(interaction.user.id).catch(err => {
        console.log(`لم أتمكن من إيجاد العضو ${interaction.user.id}: ${err}`);
      });

      if (member) {
        member.roles.add(roleId).catch(console.error);
      }
    });

    // معالجة أي أخطاء في المجمّع
    collector.on('end', collected => {
      if (collected.size === 0) {
        console.log("لم يتم جمع أي رسائل.");
      }
    });
  }
});



client.on('messageCreate', async (message) => {
  if (message.author.bot || !config.bot.taxchannels.includes(message.channelId)) return;

  // التحقق مما إذا كانت الرسالة تحتوي على رقم بصيغة 1k, 1m, 1b, 1B, 1M, 1K
  const regex = /^(\d+)([kKmMbB])?$/;
  const match = message.content.match(regex);

  if (!match) return;

  let number = parseInt(match[1]);
  const suffix = match[2] ? match[2].toLowerCase() : '';

  // تحويل القيم بناءً على اللاحقة
  switch (suffix) {
    case 'k':
      number *= 1000;
      break;
    case 'm':
      number *= 1000000;
      break;
    case 'b':
      number *= 1000000000;
      break;
  }

  try {
    const tax = parseInt(number / 0.95 + 1);
    const tax2 = parseInt(tax / 0.95 + 1);
    const rate = parseInt(number * 0.02);

    const embed = new MessageEmbed()
      .setColor(config.bot.colorembed)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true })) // صورة العضو
      .setDescription(`
        ** 
        > المبلغ كامل : \`${number}\`
        >  المبلغ مع ضريبة بروبوت : \`${tax}\`
        >  المبلغ كامل مع ضريبة الوسيط : \`${tax2}\`
        >  نسبة الوسيط 2% : \`${rate}\`
        >  المبلغ كامل مع ضريبة بروبوت و الوسيط : \`${tax2 + rate}\`
        **`)
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }) // اسم العضو وصورته
      .setTimestamp();

    // إرسال الرسالة بالـ embed
    await message.channel.send({ embeds: [embed] });
    await message.channel.send({content:`${config.bot.LineIce}`})

    // مسح الرسالة الأصلية
    await message.delete();

  } catch (error) {
    console.error(error);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // التحقق من أن الرسالة تبدأ بالأمر ${prefix}tax
  if (message.content.startsWith(`${prefix}tax`)) {
    // فصل الأمر عن الرقم
    const args = message.content.split(' ').slice(1).join(' '); // استخراج الرقم بعد ${prefix}tax

    // التحقق من أن المستخدم أدخل رقمًا
    const regex = /^(\d+)([kKmMbB])?$/;
    const match = args.match(regex);

    if (!match) {
      return message.reply('الرجاء إدخال رقم صالح مثل 1K أو 1M أو 1B ❗');
    }

    let number = parseInt(match[1]);
    const suffix = match[2] ? match[2].toLowerCase() : '';

    // تحويل القيم بناءً على اللاحقة
    switch (suffix) {
      case 'k':
        number *= 1000;
        break;
      case 'm':
        number *= 1000000;
        break;
      case 'b':
        number *= 1000000000;
        break;
    }

    try {
      const tax = parseInt(number / 0.95 + 1);
      const tax2 = parseInt(tax / 0.95 + 1);
      const rate = parseInt(number * 0.02);

      const embed = new MessageEmbed()
        .setColor(config.bot.colorembed)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true })) // صورة العضو
        .setDescription(`
          ** 
          > المبلغ كامل : \`${number}\`
          >  المبلغ مع ضريبة بروبوت : \`${tax}\`
          >  المبلغ كامل مع ضريبة الوسيط : \`${tax2}\`
          >  نسبة الوسيط 2% : \`${rate}\`
          >  المبلغ كامل مع ضريبة بروبوت و الوسيط : \`${tax2 + rate}\`
          **`)
        .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) }) // اسم العضو وصورته
        .setTimestamp();

      // إرسال الرسالة بالـ embed
      await message.channel.send({ embeds: [embed] });

      // مسح الرسالة الأصلية

    } catch (error) {
      console.error(error);
    }
  }
});



client.on('messageCreate', async message => {
    // تحقق من أن الرسالة ليست من بوت
    if (message.author.bot) return;

    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }

    // تحقق من محتوى الرسالة
    if (message.content.toLowerCase() === 'خط') {
        // حذف الرسالة الأصلية
        await message.delete();

        // الرد برسالة جديدة
        await message.channel.send(config.bot.LineIce);
    }
});



const { joinVoiceChannel } = require('@discordjs/voice');
client.on('ready', () => {
  if (config.bot.VoiceChannelId) {
    setInterval(async () => {
      client.channels.fetch(config.bot.VoiceChannelId)
        .then((channel) => {
          if (channel && channel.type === 'GUILD_VOICE') {
            try {
              const VoiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
              });
            } catch (error) {
              console.error('Voice connection error:', error);
            }
          }
        }).catch((error) => { 
          console.error('Voice channel fetch error:', error);
        });
    }, 5000) // Reduced frequency to prevent spam
  }
});


client.on('messageCreate', async (message) => {
  if (message.content.startsWith(`${config.bot.prefix}price`)) {
    if (!config.bot.owners.includes(message.author.id)) {
      message.reply('لا تملك الصلاحيات لتنفيذ هذا الأمر.');
      return;
    }
    const args = message.content.split(' ');
    if (args.length !== 2) {
      message.reply('قم بوضع سعر الآعضاء صحيح');
      return;
    }
    config.bot.price = args[1];
    fs.writeFileSync('./config.js', `module.exports = ${JSON.stringify(config, null, 2)};`, 'utf-8');

    message.reply(`اصبح سعر الآعضاء **${args[1]}**`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith(`${config.bot.prefix}coinprice`)) {
    if (!config.bot.owners.includes(message.author.id)) {
      message.reply('لا تملك الصلاحيات لتنفيذ هذا الأمر.');
      return;
    }
    const args = message.content.split(' ');
    if (args.length !== 2) {
      message.reply('قم بوضع سعر الكوينز صحيح');
      return;
    }
    config.bot.coinprice = args[1];
    fs.writeFileSync('./config.js', `module.exports = ${JSON.stringify(config, null, 2)};`, 'utf-8');

    message.reply(`اصبح سعر الكوينز **${args[1]}**`);
  }
});
