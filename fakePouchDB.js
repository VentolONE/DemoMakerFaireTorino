(function(context) {
  function VouchDB(url, options) {
    this.url = url
    this.options = options
  }

  VouchDB.prototype.info = function(first_argument) {
    return this.changes({
      fromid: 0,
      len: 1
    }).then(function(data) {
      return {
        update_seq: data.last_seq - 1
      }
    })
  };

  VouchDB.prototype.changes = function(params) {
    var deferred = Q.defer()
    reqwest({
      url: this.url,
      method: 'get',
      type: 'json',
      data: {
        loc: this.options.loc,
        fromid: params.since,
        len: params.limit
      },
      success: deferred.resolve.bind(deferred),
      error: deferred.reject.bind(deferred)
    })


    return deferred
      .promise
      .then(function(data) {
        return {
          last_seq: _.max(data.samples, 'id').id + 1,
          results: data.samples.map(function(item) {
            var obj = {
              doc: item,
              seq: item.id,
              id: item.ts * 1000
            }
            delete obj.doc.ts

            obj.doc._id = obj.id
            return obj
          })
        }
      })
  };
  context.VouchDB = VouchDB
}(window))
