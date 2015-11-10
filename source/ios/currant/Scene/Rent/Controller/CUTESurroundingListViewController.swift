//
//  CUTESurroundingListViewController.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTESurroundingListViewController)
class CUTESurroundingListViewController: UITableViewController, UISearchBarDelegate, UISearchDisplayDelegate {

    private var form:CUTESurroundingForm
    private var searchResultSurroundings:[CUTESurrounding] = []
    var postcodeIndex:String?
    internal var searchController:UISearchDisplayController?


    init(form:CUTESurroundingForm) {
        self.form = form
        super.init(style: UITableViewStyle.Plain)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }


    override func viewDidLoad() {
        super.viewDidLoad()
        super.tableView.backgroundColor = UIColor(hex6: 0xeeeeee)
        super.tableView.separatorStyle = UITableViewCellSeparatorStyle.None
        super.tableView.allowsSelection = false
        //TODO issues http://stackoverflow.com/questions/18925900/ios-7-uisearchdisplaycontroller-search-bar-overlaps-status-bar-while-searching
//        self.edgesForExtendedLayout = UIRectEdge.None
        self.definesPresentationContext = true

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.Add, block: { (sender) -> Void in

            if self.searchController == nil {
                let searchBar = UISearchBar(frame: CGRectMake(0, 20, self.view.frame.size.width, 44))
//                searchBar.barTintColor = UIColor(hex6: 0x333333)
                searchBar.delegate = self
                self.searchController = UISearchDisplayController(searchBar: searchBar, contentsController: self)
                self.searchController?.delegate = self
                self.searchController?.searchResultsDelegate = self
                self.searchController?.searchResultsDataSource = self
                self.tableView.tableHeaderView = searchBar
            }
            self.navigationController?.setNavigationBarHidden(true, animated: true)
            self.searchController?.setActive(true, animated: true)
            self.searchController?.searchBar.becomeFirstResponder()
            self.searchController?.searchContentsController.navigationController?.navigationBar.backgroundColor = self.searchController?.searchBar.backgroundColor
//            self.navigationController?.view?.addSubview(self.searchController!.searchBar)
//
//            var  frame = self.searchController?.searchResultsTableView.frame;
//            frame?.origin.y = CGRectGetHeight((self.searchController?.searchContentsController.navigationController?.navigationBar.frame)!)
//
//            frame?.size.height = CGRectGetHeight(frame!) - CGRectGetMinY(frame!);
//
//            self.searchController?.searchResultsTableView.frame = frame!;


                                                                     //TODO open a search surrounding item view controller, add item from the search result
                                                                 })
        //TODO the surrounding item can be deleted, so the table need be editable and
        //TODO the surrounding item's vehicle can be editable


    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    // MARK: - Table view data source

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        // #warning Incomplete implementation, return the number of sections
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // #warning Incomplete implementation, return the number of row
        if self.searchController?.searchResultsTableView == tableView {
            return self.searchResultSurroundings.count
        }
        return (form.ticket.property.surroundings as! [CUTESurrounding]).count
    }


    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        if self.searchController?.searchResultsTableView == tableView {
            var cell = tableView.dequeueReusableCellWithIdentifier("reuseIdentifier")
            if cell == nil {
                cell = UITableViewCell(style: UITableViewCellStyle.Default, reuseIdentifier: "reuseIdentifier")
            }
            cell?.textLabel?.text = self.searchResultSurroundings[indexPath.row].name
            return cell!
        }

        let cell = tableView.dequeueReusableCellWithIdentifier("reuseIdentifier")

        var surroundingCell:CUTESurroundingCell

        if cell is CUTESurroundingCell {
            surroundingCell = cell as! CUTESurroundingCell
        }
        else {
            surroundingCell = CUTESurroundingCell(style: UITableViewCellStyle.Default, reuseIdentifier: "reuseIdentifier")
            surroundingCell.typeButton.addTarget(self, action: "onTypeButtonPressed:", forControlEvents: UIControlEvents.TouchUpInside)
            surroundingCell.durationButton.addTarget(self, action: "onDurationButtonPressed:", forControlEvents: UIControlEvents.TouchUpInside)
            surroundingCell.removeButton.addTarget(self, action: "onRemoveButtonPressed:", forControlEvents: UIControlEvents.TouchUpInside)
        }
        let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
        let surrounding = surroundings[indexPath.row]
        surroundingCell.nameLabel.text = surrounding.name
        surroundingCell.typeButton.tag = indexPath.row
        surroundingCell.durationButton.tag = indexPath.row
        surroundingCell.removeButton.tag = indexPath.row


        var trafficTime = surrounding.trafficTimes?.filter({ (time:CUTETrafficTime) -> Bool in
            return time.isDefault
        }).first

        if trafficTime == nil {
            trafficTime = surrounding.trafficTimes?[0]
        }

        if (trafficTime != nil) {
            if trafficTime!.time != nil {
                surroundingCell.typeButton.setTitle(trafficTime!.type!.value, forState: UIControlState.Normal)
                surroundingCell.durationButton.setTitle("\(trafficTime!.time!.value) " + (trafficTime!.time!.unitForDisplay)!, forState: UIControlState.Normal)
            }
            surroundingCell.setNeedsLayout()
        }

        return surroundingCell
    }

    override func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        if self.searchController?.searchResultsTableView == tableView {
            return 40
        }
        return 80;
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        if self.searchController?.searchResultsTableView == tableView {
            let surrounding = self.searchResultSurroundings[indexPath.row]
            let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
            if  surroundings.filter({ (surr:CUTESurrounding) -> Bool in
                return surr.identifier == surrounding.identifier
            }).count == 0 {
                self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                    var array = Array(ticket.property.surroundings as! [CUTESurrounding])
                    array.append(surrounding)
                    ticket.property.surroundings = array
                    self.tableView.reloadData()
                    self.searchController?.setActive(false, animated: true)
                })
            }
        }
    }

    func searchBar(searchBar: UISearchBar, textDidChange searchText: String) {

    }

    func searchBarSearchButtonClicked(searchBar: UISearchBar) {
        CUTEGeoManager.sharedInstance.searchSurroundingsWithName(searchBar.text, postcodeIndex: nil, city: nil, country: nil, propertyPostcodeIndex:self.postcodeIndex).continueWithBlock { (task:BFTask!) -> AnyObject! in
            self.searchResultSurroundings = task.result as! [CUTESurrounding]
            self.searchController?.searchResultsTableView.reloadData()
            return task
        }
    }

    func searchDisplayController(controller: UISearchDisplayController, shouldReloadTableForSearchString searchString: String?) -> Bool {
        return true
    }

    func searchDisplayControllerDidBeginSearch(controller: UISearchDisplayController) {

    }

    func searchDisplayControllerDidEndSearch(controller: UISearchDisplayController) {
        self.navigationController?.setNavigationBarHidden(false, animated: true)
    }

    func searchDisplayController(controller: UISearchDisplayController, didHideSearchResultsTableView tableView: UITableView) {
    }

    func onTypeButtonPressed(sender:UIButton) {
        var surroundings = Array(form.ticket.property.surroundings as! [CUTESurrounding])
        let surr = surroundings[sender.tag]
        if (surr.trafficTimes != nil) {

            let modes = surr.trafficTimes!.map({ (time:CUTETrafficTime) -> String in
                return time.type!.value + " \(time.time!.value) " + time.time!.unitForDisplay
            })

            var defaultTimeIndex = 0

            for (index, time) in surr.trafficTimes!.enumerate() {
                if time.isDefault {
                    defaultTimeIndex = index
                    break
                }
            }

            ActionSheetStringPicker.showPickerWithTitle("", rows: modes, initialSelection: defaultTimeIndex, doneBlock: { (picker:ActionSheetStringPicker!, selectedIndex:Int, selectedValue:AnyObject!) -> Void in

                for time in surr.trafficTimes! {
                    time.isDefault = false
                }
                let time = surr.trafficTimes![selectedIndex]
                time.isDefault = true
                self.tableView.reloadData()
                }, cancelBlock: { (picker:ActionSheetStringPicker!) -> Void in
                    
                }, origin: sender)
        }
    }

    func onDurationButtonPressed(sender:UIButton) {
        var surroundings = Array(form.ticket.property.surroundings as! [CUTESurrounding])
        let surr = surroundings[sender.tag]
        if (surr.trafficTimes != nil) {
            var defaultTimeIndex = 0

            for (index, time) in surr.trafficTimes!.enumerate() {
                if time.isDefault {
                    defaultTimeIndex = index
                    break
                }
            }

            let defaultTime = surr.trafficTimes![defaultTimeIndex]
            let timeValue = defaultTime.time!.value
            let aroundValues = getAroundTime(timeValue).map({ (intValue:Int32) -> String in
                return "\(intValue)"
            })
            let timetValueIndex = aroundValues.indexOf("\(timeValue)")

            ActionSheetStringPicker.showPickerWithTitle("", rows: aroundValues, initialSelection:timetValueIndex!, doneBlock: { (picker:ActionSheetStringPicker!, selectedIndex:Int, selectedValue:AnyObject!) -> Void in
                if let value = Int32(selectedValue as! String) {
                    
                    self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                        var array = Array(ticket.property.surroundings as! [CUTESurrounding])
                        array[sender.tag].trafficTimes![defaultTimeIndex].time!.value = value
                        ticket.property.surroundings = array
                        self.tableView.reloadData()
                    })
                }
                }, cancelBlock: { (picker:ActionSheetStringPicker!) -> Void in
                    
                }, origin: sender)
        }

    }

    func onRemoveButtonPressed(sender:UIButton) {
        let index = sender.tag
        self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
            var array = Array(ticket.property.surroundings as! [CUTESurrounding])
            array.removeAtIndex(index)
            ticket.property.surroundings = array
            self.tableView.reloadData()
        })
    }

    private func getAroundTime(timeValue:Int32) -> [Int32] {
        return [timeValue - 30,
            timeValue - 25,
            timeValue - 20,
            timeValue - 15,
            timeValue - 10,
            timeValue - 5,
            timeValue,
            timeValue + 5,
            timeValue + 10,
            timeValue + 15,
            timeValue + 20,
            timeValue + 25,
            timeValue + 30
            ].filter { (value:Int32) -> Bool in
            return value >= 0
        }
    }
}
