/* NOTE NEED TO REWRITE DOCUMENTATION THIS IS THE AJAX DOCS NOT THE HTML
   DRIVEN DOCS... SO THE DOCUMENTATION IS WRONG......
 +----------------------------------------------------------------------
 | Copyright (c) 2016 Genome Research Ltd.
 | This file is part of the Pagesmith web framework
 +----------------------------------------------------------------------
 | The Pagesmith web framework is free software: you can redistribute
 | it and/or modify it under the terms of the GNU Lesser General Public
 | License as published by the Free Software Foundation; either version
 | 3 of the License, or (at your option) any later version.
 |
 | This program is distributed in the hope that it will be useful, but
 | WITHOUT ANY WARRANTY; without even the implied warranty of
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 | Lesser General Public License for more details.
 |
 | You should have received a copy of the GNU Lesser General Public
 | License along with this program. If not, see:
 |     <http://www.gnu.org/licenses/>.
 +----------------------------------------------------------------------

 * Functions to display feeds supplied by the action/Feed/... URL

 * This has been written in a generic way - in that the user has complete
 freedom to render the news-items, and controls in any way they wish.
 The only requirements are on the "functional" classes/ids for filtering
 and AJAX loading.

 * Note the filters and items have to appear in the same ".tags" -
 but that is the only requirement

 * Author         : js5
 * Maintainer     : js5
 * Created        : 2016-10-20
 * Last commit by : js5
 * Last modified  : 2016-10-31

<div class="container">
  <div class="page-margin">
    <select id="date-filter"    class="list-filter tags" >  <option value="">- Select year -</option>  </select>
    <select id="keyword-filter" class="list-filter tags" >  <option value="">- Select tag -</option>   </select>
    <input  id="text-filter"    class="list-filter"      type="text"    value=""  placeholder="enter your search term"  />
    <input  id="page-filter"    class="list-filter"      type="hidden"  value="0"                                       />
  </div>
  <div class="landing-article">
    <div class="page-margin">
      <div class="cards list-load" data-key="news" data-url="/action/GA4GH_Feed/news?type=card;skip=1" data-batch-size="6">
        <p class="list-loading c">Loading news items</p>
        <!-- Only shown when there are no matching items... -->
        <p class="c list-none">No news items match your criteria</p>
        <!-- The following chunk allows more chunks to be embedded in page from data retrieved.... -->
        <p class="c list-more"><a class="button">Load more...</a></p>
      </div>
    </div>
  </div>
  <div class="page-margin">
    <!-- The following parts is to allow navigation -->
    <div class="box-central-10"><div class="pagination"></div></div>
  </div>
</div>

 */

(function ($) {
  'use strict';
  // Add handlers to links to arbitrarily set filters elsewhere on the page.
  //$('.change-filter').on('click', function () {
  $('body').on('click', '.change-filter', function () {
    var f = $(this).data('filter');
    $.each(f, function (k, v) {
      $('#' + k).val(v).trigger('change');
    });
  });

  // Add handlers to the filters - they just have to be in the same container as the list
  // - and only one such list in the container...
  $('.list-filter').on('change keyup', function () {
    var $self       = $(this),
        new_filters = {},
        $list       = $self.closest('.list-container'),
        $ptr_reset  = false,
        filters     = $list.data('filters');
    console.log( filters );
    $list.find('.list-filter').each(function () {
      if ($(this).data('filter-type') !== 'page' && filters[ $(this).data('filter') ] !== $(this).val()) {
        $ptr_reset = true;
      }
      new_filters[ $(this).data('filter') ] = $(this).val();
    });
    if( $ptr_reset ) {
      new_filters[ 'page' ] = 0;
    }
    $list.data('filters', new_filters);
    console.log( new_filters );
    list_update_results( $list, 'reset' );
  });

  // Add functions to letters in A-Z panel to change the letter filter...
  $('.selectLetter li').on('click', function () {
    $('ul.selectLetter li').removeClass('active');
    $(this).closest('.list-alpha').find('input').val(
      $(this).addClass('active').text().match( /^.$/ ) ? $(this).addClass('active').text() : ''
    ).trigger('change');
  });

  // Actions on pagination clicks...
  $('.pagination').on('click', 'span', function () {
    var t = $(this).text();
    if (t === '...') {
      return;
    }
    $(this).closest('.box-pagination').find('input').val(
        t === '«'                     ? 0
      : t === '»'                     ? 10000000
      : $(this).text().match(/^\d+$/) ? (parseInt($(this).text()) - 1)
      :                                 0
    ).trigger('change');
  });

  // 1) This just makes the whole news item click-able!
  // Now functionality on the actual list-load div...
  $('.list-container').on('click', '.list-item', function () {
    // What to do when the user clicks on a feed item.
    // This opens a new window if there is a target set!!
    var x = $(this).find('a').prop('href'),
        t = $(this).find('a').prop('target');
    if (x) {
      if (t) {
        window.open(x, '_blank');
      } else {
        document.location.href = x;
      }
    }
    return false;
    // 2) This adds functionality to load in another "n" entries....
  }).on('click', '.list-more a', function () {
    // Displaying more data IF not in pagination mode - i.e we have a more link at the bottom....
    list_update_results($(this).closest('.list-load'), '');
    // 3) This grabs any pre-existing filter values (probably none!), and fetches the news/jobs/events list...
  }).each(function () {
    // Part 1 - find the container and get any associated filters....
    var $self = $(this), filters = {}, filter_info = {};
    $self.find('.list-filter').each(function () {
      filters[ $(this).data('filter') ] = $(this).val();
      filter_info[ $(this).data('filter') ] = $(this).data('filter-type');
    });

    // Nasty hack - we store filters in the URL so that we have a unique hash....
    // which we then use to re-populate the filters array when back is pressed...
    if( $self.data('key') && document.location.hash.match(/^#\{/) ) {
      console.log( document.location.hash.substr(1) );
      var t = JSON.parse( decodeURI( document.location.hash.substr(1) ) );
      if( t.hasOwnProperty( $self.data('key') ) ) {
        $.extend(filters,t[$self.data('key')]);
        $self.find('.list-filter').each(function () {
          $(this).val( filters[ $(this).data('filter') ]);
          if( $(this).data('filter-bind') ) {
            // We need to update elements...
            var f = 0, v = filters[$(this).data('filter')], ns = $('#'+$(this).data('filter-bind')).find('li');
            ns.each(function() {
              if( $(this).text() == v ) {
                f = 1;
                $(this).addClass('active');
              } else {
                $(this).removeClass('active');
              }
            });
            if( !f ) { ns.eq(0).addClass('active'); }
          }
        });
      }
    }
    // Initialize entry - by setting ptr to 0, setting results to empty list and filters to those defined!
    $self.data('filters',     filters);
    $self.data('filter-info', filter_info);
    $self.data('ptr',     0);
    // Now fetch the data from the server - and once complete - remove the ajax loading message
    // and display the results...
    list_update_results( $self, 'reset' );            // Finally update what we see on the page....
  });
/* support functions for update_filters
  hash_sorted - returns a sorted version of a hash based on values { returns as an array of k,v pairs }
  trim_list - given the output of hash_sorted {e.g.} replaces all the values (except tne first)
*/
    function hash_sorted( h ) {
      var tarr = [];
      $.each(h, function(k,v) {
        tarr.push([k,v]);
      });
      tarr.sort( function(a,b) { return a[1].toLowerCase()<b[1].toLowerCase() ? -1 : a[1].toLowerCase()>b[1].toLowerCase() ? 1 : 0; } );
      return tarr;
    }
    function trim_list( list_name, current_value, values ) {
      var fl = $(list_name).find('option').first();
      $(list_name).html('').append(fl);
      $.each(values,function(i,x){
        var n = $('<option />').prop('value',x[0]).text(x[1]);
        if( x[0] === current_value ) {
          n.prop('selected','selected');
        }
        $(list_name).append( n );
      });
      return;
    }
    function update_history( ky, flt ) {
      var t = {};
      t[ky] = flt;
      var s = '#'+JSON.stringify(t);
      if( s === '#{"-":{}}' ) {
        if( document.location.hash.match(/^#{/) ) {
          document.location.replace( '#' );
        }
      } else {
        document.location.replace( s );
      }
    }

/* list_update_results

   Now the meat of the module ... updating the results page when the data is received/filters changed

*/
  function list_update_results($list, reset_flag) {
    // If reset_flag is reset we clear the display and reset the pointer.
    if (reset_flag && reset_flag === 'reset') {
      $list.data('ptr', 0);
      $list.find('.list-more').show();
    }
      // Generate a list of the results - filtered....
    var ptr     = $list.data('ptr'),
        ky      = $list.data('key')?$list.data('key'):'-',
        flt     = $list.data('filters'),
        sz      = $list.data('batch-size'),
        f_info  = $list.data('filter-info'),
// Tweak this to filter on dom elements not entries in hash using data() / text() on nodes...
    c       = 0;
    $list.find('.list-item').each( function () {
      var el = $(this);
      var skip = 0;
      $.each(flt, function (k, v) {
        var t = f_info[k];
        if( v !== '') { // Apply filter...
          if( t === 'lookup' && ( el.data(k) != v )
           || t === 'array'  && ( el.data(k).indexOf(v) < 0 )
           || t === 'text'   && ( el.text().toLowerCase().indexOf(v.toLowerCase()) < 0 )
          ) {
            skip = 1;
            return false;
          }
        }
        return true;
      });
      if( skip ) {
        el.data('show', 0);
      } else {
        el.data('show', 1 );
        c++;
      }
      el.hide();
    });
    console.log( c );
      // Deal with the case when there are NO entries ....
      //    Show any "no entries" message and hide pagination if there is any...
    if( c === 0 ) {
      $list.find('.list-none').show();
      update_history( ky, flt );
      $list.find('.pagination').html('');
      return;
    }

      // We have entries so we hide the "no entries" message...
    $list.closest('.list-container').find('.list-none').hide();
      // We have pagination so we deal with this type of sub-nav
      //
    if( $list.closest('.list-container').find('.pagination').length ) {
      console.log( "HERE!" );
      // Get current ptr, and clear the display and pagination.....
      ptr  = flt['page'] * sz;
      var $p = $list.closest('.list-container').find('.pagination');
      // If we have less than one page we just display items, and tidy up!
      if( c <= sz ) {
        $list.find('.list-item').filter( function() { return !!$(this).data('show'); } ).show();
        flt['page'] = 0;
        $list.find('a').each(function () { ext_links($(this)); });
        $list.find('.pagination').html('');
        update_history( ky, flt );
        return;
      }
      // If ptr points to past end of list then we write ptr back to correct value...
      if( ptr >= c ) {
        ptr = sz * Math.ceil(c/sz - 1);
        flt['page'] = ptr / sz;
      }
      var i;
      // Now we render that page of hits!
      $list.find('.list-item')
           .filter( function()  { return !!$(this).data('show'); } )
           .filter( function(i) { return i >= ptr && i < ptr +sz;}  )
           .show();
        // Now we will render the pagination panel...
        // $bn is the current page
        // $bs is the start of the list - we are going to display 5 pages worth of numbers
        //     which by default is centered on $bn
        // We display a "<", optional ..., the numbered links, optional ..., ">"
        var BESIDE = 2,
            COUNT  = BESIDE * 2 + 1,
            $bn    = ptr / sz,
            $bs    = $bn - BESIDE, max_page = Math.ceil(c/sz),
            _;

        if( ( $bn + BESIDE ) > max_page ) {  // Push bs back if we are going to go past the end of the list..
          $bs = max_page - COUNT;
        }
        if ($bs < 0) {                  // Push bs forward if we are starting before the list...
          $bs = 0;
        }

        $p.html($('<span>«</span>'));
        if ($bs > 0) {
          $p.append($('<span>...</span>'));
        }
        for ( _ = $bs; _ < max_page && _ < $bs + COUNT; _++) {
          if (_ >= max_page) {
            break;
          }
          $p.append('<span' + ((ptr === _ * sz) ? ' class="active"' : '') + '>' + (_ + 1) + '</span>');
        }
        if ( $bs + COUNT < max_page ) {
          $p.append($('<span>...</span>'));
        }
        $p.append($('<span>»</span>'));
        // Finally a little bit of tidying up!
        update_history( ky, flt );
        return;
      } // END OF PAGINATION BLOCK!!!

      // Facebook more style navigation...
      // We have results - we haven't shown them all - so display the next batch!
      if (c > ptr) {
        $list.find('.list-item')
             .filter( function()  { return !!$(this).data('show'); } )
             .filter( function(i) { return i >= ptr && i < ptr +sz;}  )
             .show();
        ptr += sz;
        $list.data( 'ptr', ptr ); // reset pointer!
      }
      // If we have no more results - hide the "more link"
      if( ptr >= c ) {
        $list.find('.list-more').hide();
      }
      update_history( ky, flt );
    }
}(jQuery));
