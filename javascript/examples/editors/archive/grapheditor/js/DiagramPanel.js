/*
 * $Id: DiagramPanel.js,v 1.1 2012-03-06 12:36:45 gaudenz Exp $
 * Copyright (c) 2006-2010, JGraph Ltd
 */
DiagramPanel = function(store, mainPanel)
{
	DiagramPanel.superclass.constructor.call(this,
    {
		// TODO: Set initial sorting column and order to name, desc
        title: 'Diagrams',
        store: store,
		hideHeaders: false,
		columnSort: true,
		singleSelect: true,
		reserveScrollOffset: true,
        emptyText: 'No diagrams',

        columns: [{
            header: 'Name',
            width: 1,
            dataIndex: 'name'
        }],
        
        onContextMenu: function(e, node, scope)
        {
			var idx = this.getSelectedIndexes();
			
			if (idx.length > 0)
			{
				var name = store.getAt(idx[0]).get('name');
				
				if (name != null)
				{
		    		var menu = new Ext.menu.Menu(
		    		{
		                items: [{
		                    text:'Open',
		                    iconCls:'open-icon',
		                    scope: this,
		                    handler:function()
		                    {
	                			mainPanel.openDiagram(name);
		                    }
		                },'-',{
		                    text:'Delete',
		                    iconCls:'delete-icon',
		                    scope: this,
		                    handler:function()
		                    {
		                		if (mxUtils.confirm('Delete "'+name+'"?'))
		                		{
		                			DiagramStore.remove(name);
		                		}
		                    }
		                }]
		            });
		
		            menu.showAt([e.browserEvent.clientX, e.browserEvent.clientY]);
				}
			}
        }
    });
};

Ext.extend(DiagramPanel, Ext.ListView);
