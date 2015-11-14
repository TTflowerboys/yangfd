//
//  CUTESurroundingListViewController.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

//http://stackoverflow.com/questions/25770119/ios-8-uitableview-separator-inset-0-not-working

extension UITableViewCell {
    func removeMargins() {

        if self.respondsToSelector("setSeparatorInset:") {
            self.separatorInset = UIEdgeInsetsZero
        }

        if self.respondsToSelector("setPreservesSuperviewLayoutMargins:") {
            if #available(iOS 8.0, *) {
                self.preservesSuperviewLayoutMargins = false
            } else {
                // Fallback on earlier versions
            }
        }

        if self.respondsToSelector("setLayoutMargins:") {
            if #available(iOS 8.0, *) {
                self.layoutMargins = UIEdgeInsetsZero
            } else {
                // Fallback on earlier versions
            }
        }
    }
}

extension UITableView {
    func removeMargins() {
        self.separatorInset = UIEdgeInsetsZero

        if #available(iOS 8.0, *) {
            self.layoutMargins = UIEdgeInsetsZero
            self.preservesSuperviewLayoutMargins = false
        } else {
            // Fallback on earlier versions
        }
        if #available(iOS 9.0, *) {
            self.cellLayoutMarginsFollowReadableWidth = false
        } else {
            // Fallback on earlier versions
        }
    }
}


@objc(CUTESurroundingListViewController)
class CUTESurroundingListViewController: UITableViewController, UISearchBarDelegate, UISearchDisplayDelegate {

    private var form:CUTESurroundingForm
    private var searchResultSurroundings:[CUTESurrounding] = []
    var postcodeIndex:String?
    internal var searchController:UISearchDisplayController?
    internal var searchBarHeader:UIView?


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
        self.definesPresentationContext = true

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()

        self.showBarButtonItems()

    }

    func showBarButtonItems() {
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.Add, block: { (sender) -> Void in

            if self.view.window != nil {
                let searchBar = UISearchBar(frame: CGRectMake(0, 20, self.view.frame.size.width, 44))
                searchBar.backgroundImage = UIImage()
                searchBar.tintColor = UIColor(hex6: 0xdd3f3d)
                searchBar.barTintColor = UIColor(hex6: 0x505050)
                searchBar.backgroundColor = UIColor(hex6: 0x505050)
                searchBar.delegate = self
                self.searchController = UISearchDisplayController(searchBar: searchBar, contentsController: self)
                self.searchController?.delegate = self
                self.searchController?.searchResultsDelegate = self
                self.searchController?.searchResultsDataSource = self
                self.navigationController?.view.addSubview(self.searchController!.searchBar)
                self.searchController?.searchResultsTableView.contentInset = UIEdgeInsetsMake(searchBar.frame.size.height, 0, 0, 0);
                self.searchController?.searchResultsTableView.removeMargins()

                self.navigationController?.view.addSubview(searchBar)
                self.searchBarHeader = UIView(frame:CGRectMake(0, 0, self.view.frame.size.width, 20))
                self.searchBarHeader?.backgroundColor = UIColor(hex6: 0x505050)
                self.navigationController?.view.addSubview(self.searchBarHeader!)
                self.navigationController?.setNavigationBarHidden(true, animated: false)
                self.searchController?.setActive(true, animated: true)
                self.searchController?.searchBar.becomeFirstResponder()
            }
        })
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
                cell?.textLabel?.font = UIFont.systemFontOfSize(15)
                cell?.textLabel?.textColor = UIColor(hex6: 0x666666)
                cell?.removeMargins()
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
            return 45
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
                SVProgressHUD.show()
                self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                    var array = Array(ticket.property.surroundings as! [CUTESurrounding])
                    array.append(surrounding)
                    ticket.property.surroundings = array

                    self.searchController?.setActive(false, animated: true)
                    self.navigationController?.setNavigationBarHidden(false, animated: false)
                    self.searchController?.searchBar.removeFromSuperview()
                    self.tableView.reloadData()

                    SVProgressHUD.dismiss()
                })
            }
        }
    }

    func hideSearchBar() {
        self.searchController?.setActive(false, animated: true)
        self.navigationController?.setNavigationBarHidden(false, animated: false)

        UIView.animateWithDuration(0.4, animations: { () -> Void in
            self.searchController?.searchBar.alpha = 0
            self.searchBarHeader?.alpha = 0
            }, completion: { (stop:Bool) -> Void in
                self.searchController?.searchBar.removeFromSuperview()
                self.searchBarHeader?.removeFromSuperview()
        })
    }

    func searchBar(searchBar: UISearchBar, textDidChange searchText: String) {


    }

    func searchBarCancelButtonClicked(searchBar: UISearchBar) {
        self.hideSearchBar()
    }

    func searchBarSearchButtonClicked(searchBar: UISearchBar) {
        SVProgressHUD.show()
        CUTEGeoManager.sharedInstance.searchSurroundingsWithName(searchBar.text, latitude: nil, longitude: nil, city: nil, country: nil, propertyPostcodeIndex:self.postcodeIndex).continueWithBlock { (task:BFTask!) -> AnyObject! in
            self.searchResultSurroundings = task.result as! [CUTESurrounding]
            self.searchController?.searchResultsTableView.reloadData()
            SVProgressHUD.dismiss()
            return task
        }
    }

    func searchDisplayControllerDidBeginSearch(controller: UISearchDisplayController) {
        self.searchResultSurroundings = [] //clear last result
    }

    func searchDisplayControllerDidEndSearch(controller: UISearchDisplayController) {

        if (self.searchController?.searchBar.superview != nil) {
            self.hideSearchBar()
        }

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

                    SVProgressHUD.show()
                    self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                        var array = Array(ticket.property.surroundings as! [CUTESurrounding])
                        array[sender.tag].trafficTimes![defaultTimeIndex].time!.value = value
                        ticket.property.surroundings = array
                        self.tableView.reloadData()
                        SVProgressHUD.dismiss()
                    })
                }
                }, cancelBlock: { (picker:ActionSheetStringPicker!) -> Void in
                    
                }, origin: sender)
        }

    }

    func onRemoveButtonPressed(sender:UIButton) {
        let index = sender.tag
        SVProgressHUD.show()
        self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
            var array = Array(ticket.property.surroundings as! [CUTESurrounding])
            array.removeAtIndex(index)
            ticket.property.surroundings = array
            self.tableView.reloadData()
            SVProgressHUD.dismiss()
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
