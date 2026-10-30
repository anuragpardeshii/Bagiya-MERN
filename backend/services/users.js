function safeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    bio: user.bio || '',
    dob: user.dob || null,
    createdAt: user.createdAt,
    rankingOptIn: user.rankingOptIn || false,
    wallet: {
      balance: user.wallet?.balance || 0,
      trees: user.wallet?.trees || 0,
    },
  };
}
module.exports = { safeUser };
