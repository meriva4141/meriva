let oyuncular = [];

function CreateOyuncu(player) {
  oyuncular.push({ isim: player.name, id: player.id, galibiyet: 0, yenilgi: 0 });
}

function DeleteOyuncu(id) {
  oyuncular = oyuncular.filter(o => o.id !== id);
}

function GetOyuncu(id) {
  return oyuncular.find(o => o.id === id);
}

function GetAllOyuncular() {
  return oyuncular;
}

module.exports = {
  CreateOyuncu,
  DeleteOyuncu,
  GetOyuncu,
  GetAllOyuncular
};